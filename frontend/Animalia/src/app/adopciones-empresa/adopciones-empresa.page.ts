import { Component, OnInit } from '@angular/core';
import { AdopcionesService } from '../services/adopciones.service';
import { UsuarioService } from '../services/usuario.service'; // Importar UsuarioService
import { ToastController, IonicModule, LoadingController } from '@ionic/angular'; // Importar LoadingController
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-adopciones-empresa',
  templateUrl: './adopciones-empresa.page.html',
  styleUrls: ['./adopciones-empresa.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdopcionesEmpresaPage implements OnInit {
  empresaId: number = 0; // Inicializar empresaId
  animales: any[] = [];
  solicitudes: any[] = [];
  animalesConSolicitudes: any[] = [];
  public loading: boolean = false;
  private loadingElement: HTMLIonLoadingElement | null = null;
  segmentModel = 'animales';
  mostrarSoloEnAdopcion = false;
  error: string = '';

  constructor(
    private adopcionesService: AdopcionesService,
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.presentLoading('Cargando datos de empresa...');
    const userId = sessionStorage.getItem('id');

    if (!userId) {
      await this.dismissLoading();
      this.mostrarToast('No se encontró información del usuario. Por favor, inicie sesión nuevamente.', 'danger');
      this.router.navigate(['/perfil']);
      return;
    }

    try {
      const empresaIdFromService = await this.usuarioService.getEmpresaIdByUsuarioId(userId).toPromise();
      if (empresaIdFromService === null || empresaIdFromService === undefined) {
        throw new Error('No se pudo obtener el ID de la empresa para el usuario.');
      }
      this.empresaId = Number(empresaIdFromService);

      if (!this.empresaId) {
        throw new Error('No se encontró una empresa asociada a este usuario o el ID no es válido.');
      }

      sessionStorage.setItem('empresaId', this.empresaId.toString());
      await this.cargarDatos();
    } catch (err: any) {
      console.error('Error obteniendo datos de empresa:', err);
      this.error = err.message || 'Error crítico cargando los datos de empresa.';
      this.mostrarToast(this.error, 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async presentLoading(message: string) {
    this.loading = true;
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
    }
    this.loadingElement = await this.loadingController.create({
      message,
      spinner: 'circles',
    });
    await this.loadingElement.present();
  }

  async dismissLoading() {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
    this.loading = false;
  }

  async cargarDatos() {

    if (!this.empresaId) {
      this.error = 'ID de empresa no disponible. No se pueden cargar los datos.';
      this.mostrarToast(this.error, 'warning');
      return;
    }
    try {
      this.animales = (await this.adopcionesService.getAnimalesEmpresa(this.empresaId).toPromise()) || [];
      this.solicitudes = (await this.adopcionesService.getSolicitudesEmpresa(this.empresaId).toPromise()) || [];
      this.animalesConSolicitudes = this.animales.filter(animal =>
        this.solicitudes.some(sol => sol.animal.id === animal.id)
      );
      if (this.animales.length === 0 && this.solicitudes.length === 0) {
        this.mostrarToast('No hay animales ni solicitudes para mostrar.', 'tertiary');
      }
    } catch (err: any) {
      console.error('Error cargando datos específicos de la empresa:', err);
      this.error = 'Error cargando animales/solicitudes: ' + (err.message || 'Error desconocido');
      this.mostrarToast(this.error, 'danger');
    }

  }


  segmentChanged(ev: any) {
    this.segmentModel = ev.detail.value;
  }

  toggleListaAnimalesAdopcion() {
    this.mostrarSoloEnAdopcion = !this.mostrarSoloEnAdopcion;
  }

  getAnimalesParaMostrar() {
    if (this.mostrarSoloEnAdopcion) {
      return this.animales.filter(animal => animal.estadoAdopcion === 'DISPONIBLE');
    }
    return this.animales;
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

  async responderSolicitud(solicitud: any, nuevoEstado: string) {
    try {
      console.log(`Simulando respuesta a solicitud ${solicitud.id} con estado ${nuevoEstado}`);
      solicitud.estado = nuevoEstado;

      if (nuevoEstado === 'APROBADA') {
        const animal = this.animales.find(a => a.id === solicitud.animal.id);
        if (animal) {
          console.log(`Simulando cambio de estado de animal ${animal.id} a EN_PROCESO`);
          animal.estadoAdopcion = 'EN_PROCESO';
        }
      }
      this.mostrarToast(`Solicitud ${nuevoEstado.toLowerCase()} (simulado) correctamente`, 'success');
    } catch (err: any) {
      this.mostrarToast('Error al responder la solicitud (simulado): ' + (err.message || 'Error desconocido'), 'danger');
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
