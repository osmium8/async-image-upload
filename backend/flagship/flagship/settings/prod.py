from .base import *

# specify ip-address(es)
ALLOWED_HOSTS = ['*'] 

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': '<name>',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST':'localhost',
        'PORT':'3306',
    }
}

CELERY_BROKER_URL = "redis://localhost:6379"
CELERY_RESULT_BACKEND = "redis://localhost:6379"

# specify ip-address(es)
CORS_ORIGIN_ALLOW_ALL = True
CORS_ORIGIN_WHITELIST = (
       'http://localhost:4200',
)