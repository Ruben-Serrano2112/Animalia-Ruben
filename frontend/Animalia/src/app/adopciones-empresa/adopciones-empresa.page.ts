import { Component, OnInit } from '@angular/core';
import { AdopcionesService } from '../services/adopciones.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-adopciones-empresa',
  templateUrl: './adopciones-empresa.page.html',
  styleUrls: ['./adopciones-empresa.page.scss'],
})
export class AdopcionesEmpresaPage implements OnInit {
  empresaId = 1; // TODO: Reemplazar por el id real del usuario logueado
  animales: any[] = [];
  solicitudes: any[] = [];
  animalesConSolicitudes: any[] = [];
  loading = false;

  constructor(
    private adopcionesService: AdopcionesService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    try {
      this.animales = (await this.adopcionesService.getAnimalesEmpresa(this.empresaId).toPromise()) || [];
      this.solicitudes = (await this.adopcionesService.getSolicitudesEmpresa(this.empresaId).toPromise()) || [];
      this.animalesConSolicitudes = this.animales.filter(animal =>
        this.solicitudes.some(sol => sol.animal.id === animal.id)
      );
    } catch (err) {
      this.mostrarToast('Error cargando datos', 'danger');
    }
    this.loading = false;
  }

  async cambiarDomestico(animal: any, value: boolean) {
    try {
      await this.adopcionesService.updateDomesticoYEstado(animal.id, value, animal.estadoAdopcion).toPromise();
      animal.isDomestico = value;
      this.mostrarToast('Actualizado correctamente', 'success');
    } catch (err) {
      this.mostrarToast('Error actualizando', 'danger');
    }
  }

  async cambiarEstadoAdopcion(animal: any, value: string) {
    try {
      await this.adopcionesService.updateDomesticoYEstado(animal.id, animal.isDomestico, value).toPromise();
      animal.estadoAdopcion = value;
      this.mostrarToast('Actualizado correctamente', 'success');
    } catch (err) {
      this.mostrarToast('Error actualizando', 'danger');
    }
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color
    });
    toast.present();
  }
}
