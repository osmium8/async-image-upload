import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flagship.settings.dev")
app = Celery("flagship", include=['flagship.tasks'])
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()