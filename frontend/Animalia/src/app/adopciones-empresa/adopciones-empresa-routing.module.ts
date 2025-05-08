import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdopcionesEmpresaPage } from './adopciones-empresa.page';

const routes: Routes = [
  {
    path: '',
    component: AdopcionesEmpresaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdopcionesEmpresaPageRoutingModule {}
