import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DonacionesPageRoutingModule } from './donaciones-routing.module';
import { DonacionesPage } from './donaciones.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    DonacionesPageRoutingModule
  ],
  declarations: [DonacionesPage]
})
export class DonacionesPageModule {}
