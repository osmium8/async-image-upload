from .base import *
import dj_database_url

# specify ip-address(es)
ALLOWED_HOSTS = ['*'] 

# RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
# if RENDER_EXTERNAL_HOSTNAME:
#     ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}

RQ_QUEUES = {
    'default': {
    'HOST': 'red-ci88et98g3n3vm405hng',
    'PORT': 6379,
    'DB': 0,
    }
}

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = "redis://red-ci88et98g3n3vm405hng:6379"

# specify ip-address(es)
CORS_ORIGIN_ALLOW_ALL = True
CORS_ORIGIN_WHITELIST = (
       'http://localhost:4200',
)