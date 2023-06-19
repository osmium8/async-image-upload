import os
from celery import shared_task
from PIL import Image
import base64
import gallery.models
from io import BytesIO
from celery.utils.log import get_task_logger
from django.core.files import File
from django.core.files.storage import FileSystemStorage
from pathlib import Path
from common.storage import bucket
from datetime import datetime

logger = get_task_logger(__name__)


@shared_task
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
        image = gallery.models.Image.objects.get(pk=pk)
        image.url = blob.public_url
        image.thumbnail_url = thumbnail_blob.public_url
        image.save()

        # Delete temp files created
        if os.path.isfile(path):
            os.remove(path)
        if os.path.isfile(thumbnail_path):
            os.remove(thumbnail_path)
