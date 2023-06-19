import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserLoginResponse } from './model/user-login.response.model';
import { UserSignupRequest } from './model/user-signup-request.model';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    constructor(
        private jwtHelper: JwtHelperService,
        private authService: AuthService,
        private router: Router
    ) { }
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (req.url.indexOf('token') > -1 || req.url.indexOf('register') > -1) {
            return next.handle(req);
        }

        const localStorageTokens = localStorage.getItem('tokens');
        var token: UserLoginResponse;
        if (localStorageTokens) {
            token = JSON.parse(localStorageTokens) as UserLoginResponse;
            var isTokenExpired = this.jwtHelper.isTokenExpired(token?.access);
            if (isTokenExpired) {
                console.log('token expired');
            } else {
                console.log('token not expired');
            }
            if (!isTokenExpired) {
                return next.handle(req);
            } else {
                return this.authService.refreshToken(token).pipe(
                    switchMap((newTokens: UserLoginResponse) => {
                        localStorage.setItem('tokens', JSON.stringify(newTokens));
                        var userInfo = this.jwtHelper.decodeToken(
                            newTokens.access
                        ) as UserSignupRequest;
                        this.authService.userProfile.next(userInfo);
                        const transformedReq = req.clone({
                            headers: req.headers.set(
                                'Authorization',
                                `bearer ${newTokens.access}`
                            ),
                        });
                        return next.handle(transformedReq);
                    })
                );
            }
        }
        this.router.navigate(['/']);
        return throwError(() => 'Invalid call');
    }
}