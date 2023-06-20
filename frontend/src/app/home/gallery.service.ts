import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { Observable } from 'rxjs';
import { ImageResponse } from './model/image-response.model';
import { Image } from './model/image.model';



@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(private http: HttpClient) { }

  url: string = environment.backend_api_url

  getImages(): Observable<Image[]> {
    return this.http.get<Image[]>(this.url + 'gallery/');
  }

  getImage(id: any): Observable<Image> {
    return this.http.get<Image>(this.url + 'gallery/detail/?id='+id);
  }

  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(this.url + 'gallery/upload/', formData)
  }

  deleteImage(id: any): Observable<any>  {
    return this.http.delete<any>(this.url + 'gallery/delete/?id='+id);
  }
}
