from rest_framework import serializers
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    """
    Serializer for Image model
    """
    image_file = serializers.ImageField(write_only=True, required=True)
    url = serializers.URLField(read_only=True)

    class Meta:
        model = Image
        fields = ('id', 'url', 'thumbnail_url', 'title', 'description', 'date_uploaded', 'image_file')

class ImageListSerializer(serializers.ModelSerializer):
    """
    Serializer for Image list
    """

    class Meta:
        model = Image
        fields = ('id', 'thumbnail_url', 'title', 'date_uploaded')

