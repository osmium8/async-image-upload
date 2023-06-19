import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize, Observable } from 'rxjs';
import { GalleryService } from './gallery.service';
import { Image } from './model/image.model';
import { formatDate } from '../shared/utils'
import { inject } from '@angular/core';
import { ImageResponse } from './model/image-response.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    // providers: [MessageService]
})
export class HomeComponent implements OnInit {

    file?: File;
    uploadImageDialog: boolean;
    images: Image[] = [];
    processedData: Image[][] = [];
    image: Image;

    uploadPercent: number = 0;
    uploadPercent$: Observable<number | undefined> | undefined

    uploadTask: boolean = false;
    uploadedFileName: string | undefined;

    @ViewChild('fileInput')
    fileInputVariable: ElementRef | undefined;

    constructor(private router: Router, public service: GalleryService, private messageService: MessageService) {
        this.uploadImageDialog = false;
        this.file = undefined
        this.image = { 'url': '', 'title': '', 'description': '' };
    }

    ngOnInit() {
        this.fetchGallery();
    }

    async reset() {
        this.file = undefined
        this.fileInputVariable!.nativeElement.value = "";
        this.uploadTask = false;
    }

    openDialog() {
        this.image = { 'url': '', 'title': '', 'description': '' };
        this.uploadImageDialog = true;
    }

    hideDialog() {
        this.uploadImageDialog = false;
    }

    saveImage() {
        if (this.image) {
            if (this.image) {
                this.messageService.add({ severity: 'success', summary: 'Image Uploaded', detail: 'Thumbnail will be generated shorlty', life: 3000 });
                this.image.image_file = this.file
                const formData = new FormData();
                if (this.file) {
                    formData.append('image_file', this.file, this.file.name)
                    formData.append('title', this.image.title)
                    formData.append('description', this.image.description)
                }
                this.service.uploadImage(formData)
                    .subscribe((response: any) => {
                        console.log('saveImage()...', response);
                        if (response.status) {
                            this.fetchGallery();
                        }
                    });
            }
            this.hideDialog();
            this.image = { 'url': '', 'title': '', 'description': '' };
        }
    }

    async uploadFile(event: any) {
        this.uploadTask = true;
        this.file = event.target.files[0];
        this.uploadedFileName = this.file!.name;
      }

    fetchGallery() {
        this.service.getImages().subscribe((response: Image[]) => {
            console.log(response)
            this.images = response;
        });
    }

    openFullView(id: any) {
        this.router.navigate(['/full-view/'+id]);
    }

}
