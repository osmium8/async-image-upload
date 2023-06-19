from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from rest_framework.generics import ListAPIView, CreateAPIView, \
    RetrieveUpdateDestroyAPIView, GenericAPIView, DestroyAPIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Image
from .serializers import ImageSerializer, ImageListSerializer
from rest_framework.views import APIView
from django.db.utils import IntegrityError
from flagship.tasks import upload_image
import django_rq
from celery import current_app
from django.core.files import File
from common.storage import file_system_storage
from pathlib import Path

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
        queryset = Image.objects.filter(
            user=self.request.user).order_by('-date_uploaded')
        return queryset


class ImageDetailAPIView(GenericAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        id = request.query_params.get('id', None)
        if id:
            image = Image.objects.get(pk=id)
            serializer = ImageSerializer(image, many=False)
            print(serializer.data)
            return Response(serializer.data)
        else:
            return Response({'status': 'false', 'message': 'Image id is required'})


class ImageDeleteAPIView(DestroyAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        id = request.query_params.get('id', None)
        if id:
            image = Image.objects.get(pk=id)
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
            image = Image(
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
