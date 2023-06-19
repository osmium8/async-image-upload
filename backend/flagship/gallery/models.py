from django.db import models


DEFAULT_IMAGE_URL: str = 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE='

class Image(models.Model):
    url = models.URLField(max_length=500, default=DEFAULT_IMAGE_URL)
    thumbnail_url = models.URLField(max_length=500, default=DEFAULT_IMAGE_URL)
    title = models.CharField(max_length=100, blank=False)
    description = models.CharField(max_length=500, blank=False)
    date_uploaded = models.DateTimeField(auto_now_add=True, editable=False)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)

    def __str__(self):
        return self.title