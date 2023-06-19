import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth/auth.service';
import { AuthTokenInterceptor } from './auth/auth-token-interceptor';
import { FullViewComponent } from './full-view/full-view.component';

export function jwtOptionFactor(authService:AuthService){
  console.log(authService.getAccessToken())
  return {
    tokenGetter:() => {
      return authService.getAccessToken();
    },
    allowedDomains:["127.0.0.1:8000"],
    disallowedRoutes:[
      "http://127.0.0.1:8000/api/auth/register",
      "http://127.0.0.1:8000/api/auth/token"
    ]
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FullViewComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    JwtModule.forRoot({
      jwtOptionsProvider:{
        provide:JWT_OPTIONS,
        useFactory: jwtOptionFactor,
        deps:[AuthService]
      } 
    })
  ],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
