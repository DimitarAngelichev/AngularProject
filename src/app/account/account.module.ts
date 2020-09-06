import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login.component';



@NgModule({
  declarations:
    [
      LayoutComponent,
      LoginComponent
    ],
  imports: [
    CommonModule,
    AccountRoutingModule
  ]
})

export class AccountModule { }
