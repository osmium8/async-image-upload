#!/usr/bin/env bash
# exit on error
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

celery --app=flagship  worker -l INFO --pool=solo

# python flagship/manage.py makemigrations
python manage.py collectstatic --no-input
python manage.py migrate