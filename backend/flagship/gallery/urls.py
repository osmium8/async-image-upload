from django.urls import path
from .views import ImageList, ImageCreate, ImageDetailAPIView, ImageDeleteAPIView

urlpatterns = [
    path('', ImageList.as_view()),
    path('upload/', ImageCreate.as_view()),
    path('detail/', ImageDetailAPIView.as_view()),
    path('delete/', ImageDeleteAPIView.as_view()),
]