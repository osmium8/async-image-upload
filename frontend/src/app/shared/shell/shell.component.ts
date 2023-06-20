import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { AuthResponse } from 'app/auth/model/auth-response.model';
import { UserSignupRequest } from 'app/auth/model/user-signup-request.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {

  isAuthenticated: boolean

  constructor(public router: Router, public authService: AuthService) {
    this.isAuthenticated = false;
  }

  ngOnInit() {
    this.authService.userProfile.subscribe((data) => {
      if (data) {
        console.log(data.first_name)
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    })
  }

  signOut() {
    this.router.navigate(['/auth']);
    this.authService.userProfile.next(null);
    // this.authService.logout().subscribe((value: any) => {
    //   console.log(value);
    // });
  }

  items: MenuItem[] = [
    {
      label: 'Gallery',
      icon: 'pi pi-images',
      routerLink: ['']
    },
    {
      label: 'Auth',
      icon: 'pi pi-key',
      routerLink: ['/auth']
    }
  ];
}
