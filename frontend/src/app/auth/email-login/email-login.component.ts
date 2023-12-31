import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserLoginResponse } from '../model/user-login.response.model';
import { User } from '../model/user.model';

@Component({
    selector: 'app-email-login',
    templateUrl: './email-login.component.html',
    styleUrls: ['./email-login.component.css']
})
export class EmailLoginComponent implements OnInit {

    form: FormGroup;

    type: 'login' | 'signup' = 'login';
    loading = false;

    serverMessage: string = '';

    constructor(private fb: FormBuilder, public authService: AuthService, private router: Router) {
        this.form = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [Validators.minLength(8), Validators.required]
            ],
        });
    }

    ngOnInit() {

    }

    changeType(val: 'login' | 'signup') {
        this.type = val;
        this.serverMessage = '';
    }

    get isLogin() {
        return this.type === 'login';
    }

    get isSignup() {
        return this.type === 'signup';
    }

    get firstName() {
        return this.form.get('firstName');
    }

    get lastName() {
        return this.form.get('lastName');
    }

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }

    onSubmit() {
        this.loading = true;

        const firstName: string = this.firstName!.value
        const lastName: string = this.lastName!.value
        const email = this.email!.value;
        const password = this.password!.value;

        try {
            if (this.isLogin) {
                this.authService.login({
                    email: email,
                    password: password
                }).subscribe((isAuthenticated: Boolean) => {
                    console.log('login component: ', isAuthenticated)
                    if (isAuthenticated) {
                        this.router.navigate(['']);
                    } else {
                        this.serverMessage = 'Invalid credentials';
                    }
                });
            }
            if (this.isSignup) {
                this.authService.signup({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password
                }).subscribe({
                    next: (user: User) => {
                        console.log(user);
                    },
                    error: (e: HttpErrorResponse) => {
                        console.log(e);
                        this.serverMessage = e.error.email;
                    }
                });
            }
        } catch (err) {
            this.serverMessage = err as string;
        }

        this.loading = false;
    }

}