#!/usr/bin/env bash
# exit on error
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

# python flagship/manage.py makemigrations
python flagship/manage.py collectstatic --no-input
python flagship/manage.py migrate