import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryService } from 'app/home/gallery.service';
import { Image } from 'app/home/model/image.model'

@Component({
    selector: 'app-full-view',
    templateUrl: './full-view.component.html',
    styleUrls: ['./full-view.component.css']
})
export class FullViewComponent implements OnInit
{
    public image?: Image

    constructor(
        private _Activatedroute: ActivatedRoute, 
        private service: GalleryService,
        private router: Router) {}

    ngOnInit()
    {
        this._Activatedroute.params.subscribe(params => {
            const id = params['id'];
            this.service.getImage(id).subscribe(response => {
                console.log(response);
                this.image = response;
            });
        });
    }

    deleteImage() {
        this.service.deleteImage(this.image?.id)
        .subscribe(response => {
            if (response.status) {
                this.router.navigate(['']);
            }
        });
    }
}
