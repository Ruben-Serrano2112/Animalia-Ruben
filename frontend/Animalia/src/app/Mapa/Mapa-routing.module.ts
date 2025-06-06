import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapaPage } from './Mapa.page';

const routes: Routes = [
  {
    path: '',
    component: MapaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaPageRoutingModule {}
