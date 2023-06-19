import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailLoginComponent } from './email-login/email-login.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
  declarations: [
    EmailLoginComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
