import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DonacionesPage } from './donaciones.page';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DonacionesPage,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonacionesPageRoutingModule {}
