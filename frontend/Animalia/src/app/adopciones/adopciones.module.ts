import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdopcionesPageRoutingModule } from './adopciones-routing.module';
import { AdopcionesPage } from './adopciones.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    AdopcionesPageRoutingModule
  ],
  declarations: [AdopcionesPage]
})
export class AdopcionesPageModule {}
