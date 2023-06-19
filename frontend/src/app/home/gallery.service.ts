import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageResponse } from './model/image-response.model';
import { Image } from './model/image.model';



@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private http: HttpClient) { }

  getImages(): Observable<Image[]> {
    return this.http.get<Image[]>('http://127.0.0.1:8000/api/gallery/');
  }

  getImage(id: any): Observable<Image> {
    return this.http.get<Image>('http://127.0.0.1:8000/api/gallery/detail/?id='+id);
  }

  uploadImage(formData: FormData): Observable<any> {
    return this.http.post('http://127.0.0.1:8000/api/gallery/upload/', formData)
  }

  deleteImage(id: any): Observable<any>  {
    return this.http.delete<any>('http://127.0.0.1:8000/api/gallery/delete/?id='+id);
  }
}
