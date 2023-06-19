pip install -r requirements.txt

# python flagship/manage.py makemigrations
python manage.py collectstatic --no-input
python flagship/manage.py migrate