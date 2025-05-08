import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdopcionesEmpresaPageRoutingModule } from './adopciones-empresa-routing.module';

import { AdopcionesEmpresaPage } from './adopciones-empresa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdopcionesEmpresaPageRoutingModule
  ],
  declarations: [AdopcionesEmpresaPage]
})
export class AdopcionesEmpresaPageModule {}
