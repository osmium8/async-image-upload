
import firebase_admin
from firebase_admin import credentials, storage
from django.core.files.storage import FileSystemStorage

cred = credentials.Certificate("C:\\Users\\pranshumalhotra\\Downloads\\private_key.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'gallery-angular-drf.appspot.com'
})

bucket = storage.bucket()

file_system_storage = FileSystemStorage(location='./temp')