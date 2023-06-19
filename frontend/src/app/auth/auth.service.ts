import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { AuthResponse } from './model/auth-response.model'
import { UserLoginRequest } from './model/user-login-request.model';
import { UserLoginResponse } from './model/user-login.response.model';
import { UserSignupRequest } from './model/user-signup-request.model';
import { User } from './model/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    url: string = environment.backend_api_url

    userProfile = new BehaviorSubject<UserSignupRequest | null>(null);
    jwtService: JwtHelperService = new JwtHelperService();

    getAccessToken(): string {
        var localStorageToken = localStorage.getItem('tokens');
        if (localStorageToken) {
            var token = JSON.parse(localStorageToken) as UserLoginResponse;
            var isTokenExpired = this.jwtService.isTokenExpired(token.access);
            if (isTokenExpired) {
                this.userProfile.next(null);
                return "";
            }
            var userInfo = this.jwtService.decodeToken(
                token.access
            );
            this.userProfile.next(userInfo);
            return token.access;
        }
        return "";
    }

    isAuthenticated(): Observable<AuthResponse> {
        // let source$ = new Observable<AuthResponse>(subscriber => {
        //   subscriber.next({status: true});
        // });
        // return source$;
        return this.http.get<AuthResponse>(this.url + 'auth/isauthenticated/');
    }

    signup(request: UserSignupRequest): Observable<User> {
        // let source$ = new Observable<User>(subscriber => {
        //   subscriber.next({firstName: 'Pranshu', lastName: 'Malhotra', email: 'XXXXXXXXXXXXXXXXX'});
        // });
        // return source$;
        return this.http.post<User>(this.url + 'api/auth/register/', request);
    }

    login(request: UserLoginRequest): Observable<Boolean> {
        // let source$ = new Observable<User>(subscriber => {
        //   subscriber.next({firstName: 'Pranshu', lastName: 'Malhotra', email: 'XXXXXXXXXXXXXXXXX'});
        // });
        // return source$;
        return this.http
            .post<UserLoginResponse>(this.url + 'api/auth/token/', request)
            .pipe(
                map((data: UserLoginResponse) => {
                    var token = data;

                    localStorage.setItem('tokens', JSON.stringify(token));

                    var userInfo = this.jwtService.decodeToken(
                        token.access
                    ) as UserSignupRequest;

                    console.log('getAccessToken '+userInfo.user_id)

                    this.userProfile.next(userInfo);

                    return true;
                }),
                catchError((error) => {
                    console.log(error);
                    return of(false);
                })
            );
    }

    logout(): Observable<Boolean> {
        return this.http
            .get<any>(this.url + 'api/auth/logout/')
            .pipe(
                map((data: any) => {
                    console.log(data);
                    this.userProfile.next(null);
                    localStorage.removeItem('tokens');
                    return true;
                }),
                catchError((error) => {
                    console.log(error);
                    return of(false);
                })
            );
    }

    refreshToken(payload: UserLoginResponse) {
        return this.http
            .post<UserLoginResponse>(this.url + 'auth/token/refresh/', payload);
    }
}