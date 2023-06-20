import os
from datetime import datetime
from io import BytesIO
from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from rest_framework.generics import ListAPIView, CreateAPIView, \
    RetrieveUpdateDestroyAPIView, GenericAPIView, DestroyAPIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .serializers import ImageSerializer, ImageListSerializer
from rest_framework.views import APIView
from django.db.utils import IntegrityError
from flagship.tasks import upload_image
import django_rq
from celery import current_app
from django.core.files import File
from common.storage import file_system_storage
from pathlib import Path
import models
from common.storage import bucket
# Create your views here.


class ImageList(ListAPIView):
    serializer_class = ImageListSerializer
    permission_classes = [permissions.IsAuthenticated]
    # filter_backends = (DjangoFilterBackend, SearchFilter)
    filter_fields = ('id',)
    search_fields = ('name', 'description')
    # pagination_class = ImagesPagination

    def get_queryset(self):
        queryset = models.Image.objects.filter(
            user=self.request.user).order_by('-date_uploaded')
        return queryset


class ImageDetailAPIView(GenericAPIView):
    queryset = models.Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        id = request.query_params.get('id', None)
        if id:
            image = models.Image.objects.get(pk=id)
            serializer = ImageSerializer(image, many=False)
            print(serializer.data)
            return Response(serializer.data)
        else:
            return Response({'status': 'false', 'message': 'Image id is required'})


class ImageDeleteAPIView(DestroyAPIView):
    queryset = models.Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        id = request.query_params.get('id', None)
        if id:
            image = models.Image.objects.get(pk=id)
            image.delete()
            return Response({'status': 'true', 'message': 'Image deleted'})
        else:
            return Response({'status': 'false', 'message': 'Image id is required'})


class TaskView(View):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, task_id):
        task = current_app.AsyncResult(task_id)
        response_data = {'task_status': task.status, 'task_id': task.id}

        if task.status == 'SUCCESS':
            response_data['results'] = task.get()

        return JsonResponse(response_data)


class ImageCreate(APIView):

    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            print(serializer.validated_data)
            image = models.Image(
                title=serializer.validated_data['title'],
                description=serializer.validated_data['description'],
                user=request.user
            )
            image.save()

            # save image file temporarily in local file system
            image_file = serializer.validated_data['image_file']
            file_name = image_file.name
            image_file.name = './temp/' + \
                file_system_storage.get_available_name(image_file)
            file_system_storage.save(image_file.name, File(image_file))

            # upload image to firebase storage, asynchronously
            task = upload_image.delay(
                path=file_system_storage.path(image_file.name),
                pk=image.pk,
                user_id=request.user.id,
                file_name=file_name
            )

            data = {'status': 'true', 'data': {
                'title': image.title, 'task': task.id}}
            return Response(data, 200)

        except IntegrityError:
            # The image is already uploaded by the user

            data = {'status': 'false', 'message': 'Already uploaded'}
            return Response(data, 400)

        # raise ValidationError({ 'price': 'A valid number is required' })

def upload_image(path: str, pk: str, user_id: str, file_name: str):
    print("UPLOAD IMAGE TASK"+file_name)

    path_object = Path(path)
    blob_path = str(user_id) + '/' + str(datetime.now()) + file_name
    blob = bucket.blob(blob_path)

    with path_object.open(mode='rb') as file:

        # Upload image to bucket
        blob.upload_from_file(file)
        blob.make_public()
        # logger.info(blob.public_url)

        # Create thumbnail
        picture = File(file, name=path_object.name)
        SIZE = 50, 50
        data_img = BytesIO()
        tiny_img = Image.open(picture)
        tiny_img.thumbnail(SIZE)
        thumbnail_path = './temp/' + 'thumb_' + file_name
        tiny_img.save(thumbnail_path)
        tiny_img.save(data_img, format="BMP")

        # Close temp files
        tiny_img.close()
        file.close()

        # Upload thumbnail to bucket
        thumbnail_blob_path = str(user_id) + '/' + \
            str(datetime.now()) + '_thumb_' + file_name
        thumbnail_blob = bucket.blob(thumbnail_blob_path)
        thumbnail_blob.upload_from_string(
            data_img.getvalue(), content_type="image/jpeg")
        thumbnail_blob.make_public()
        # logger.info(thumbnail_blob.public_url)

        # Update image object in database
        image = models.Image.objects.get(pk=pk)
        image.url = blob.public_url
        image.thumbnail_url = thumbnail_blob.public_url
        image.save()

        # Delete temp files created
        if os.path.isfile(path):
            os.remove(path)
        if os.path.isfile(thumbnail_path):
            os.remove(thumbnail_path)

