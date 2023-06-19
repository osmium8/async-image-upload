import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailLoginComponent } from './email-login/email-login.component';

const routes: Routes = [
  {path: '', component: EmailLoginComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }