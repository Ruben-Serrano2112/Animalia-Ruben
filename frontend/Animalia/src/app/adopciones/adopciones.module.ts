import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdopcionesPageRoutingModule } from './adopciones-routing.module';
import { AdopcionesPage } from './adopciones.page';
import { RouterModule } from '@angular/router';
import { AdopcionModalComponent } from './adopcion-modal/adopcion-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    AdopcionesPageRoutingModule,
    AdopcionModalComponent
  ],
  declarations: [AdopcionesPage]
})
export class AdopcionesPageModule {}
