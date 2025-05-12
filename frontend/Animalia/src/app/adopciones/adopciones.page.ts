import { Component, OnInit } from '@angular/core';
import { AnimalesService } from '../services/animales.service';
import { Router } from '@angular/router';
import { ToastController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { AdopcionesService } from '../services/adopciones.service';

@Component({
  selector: 'app-adopciones',
  templateUrl: './adopciones.page.html',
  styleUrls: ['./adopciones.page.scss'],
  standalone: false
})
export class AdopcionesPage implements OnInit {

  animalesDisponiblesUsuario: any[] = [];
  filteredAnimalesUsuario: any[] = [];

  totalAnimalesUsuario: number = 0;
  totalPagesUsuario: number = 0;
  currentPageUsuario: number = 0;
  currentPagehtmlUsuario: number = 1;
  paginaActualUsuario: any[] = [];

  animalesGestionEmpresa: any[] = [];

  userId: number | null = null;
  selectedFamilia: string | null = null;
  selectedAnimal: any = null;

  itemsPerPage: number = 5;

  userRol: string | null = null;
  empresaId: number = 0;
  solicitudes: any[] = [];
  public loading: boolean = false;
  private loadingElement: HTMLIonLoadingElement | null = null;
  segmentModel = 'animales';
  mostrarSoloEnAdopcion = false;
  error: string | null = null;

  handleImageError(event: Event, defaultSrc: string) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = defaultSrc;
    }
  }

  constructor(
    private animalesService: AnimalesService,
    private adopcionesService: AdopcionesService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController,
    private usuarioService: UsuarioService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) {
    const userIdStr = sessionStorage.getItem('id');
    this.userId = userIdStr ? parseInt(userIdStr) : null;
    this.userRol = sessionStorage.getItem('rol');
  }

  async ngOnInit() {
    await this.presentLoading('Cargando...');

    if (this.userRol === 'EMPRESA') {
      const userIdForEmpresa = sessionStorage.getItem('id');
      if (userIdForEmpresa) {
        try {
          const empresaIdFromService = await this.usuarioService.getEmpresaIdByUsuarioId(userIdForEmpresa).toPromise();
          if (empresaIdFromService === null || empresaIdFromService === undefined) {
            throw new Error('No se pudo obtener el ID de la empresa para el usuario.');
          }
          this.empresaId = Number(empresaIdFromService);
          if (!this.empresaId) {
            throw new Error('No se encontró una empresa asociada o el ID no es válido.');
          }
          sessionStorage.setItem('empresaId', this.empresaId.toString());
          await this.cargarDatosEmpresa();
        } catch (err: any) {
          console.error('Error obteniendo datos de empresa:', err);
          this.error = err.message || 'Error crítico cargando datos de empresa.';
          if (this.error) this.mostrarMensaje(this.error, 'danger');
          await this.dismissLoading();
        }
      } else {
        this.error = 'Usuario (empresa) no autenticado.';
        if (this.error) this.mostrarMensaje(this.error, 'danger');
        await this.dismissLoading();
      }
    } else {
      this.cargarAnimalesDisponibles();
    }
  }


  cargarAnimalesDisponibles() {

    this.animalesService.getAnimalesDisponiblesAdopcion().subscribe(
      (animales: any[]) => {
        this.animalesDisponiblesUsuario = animales.map((animal: any) => ({
          ...animal,
          estado_conservacion: animal.estado_conservacion ? animal.estado_conservacion.replace(/_/g, ' ') : 'No especificado'
        }));
        this.filteredAnimalesUsuario = [...this.animalesDisponiblesUsuario];
        this.totalAnimalesUsuario = this.filteredAnimalesUsuario.length;
        this.totalPagesUsuario = Math.ceil(this.totalAnimalesUsuario / this.itemsPerPage);
        this.currentPageUsuario = 0;
        this.currentPagehtmlUsuario = 1;
        this.actualizarPagina();
        this.dismissLoading();
      },
      (error) => {
        console.error('Error al cargar animales:', error);
        this.error = 'Error al cargar animales disponibles.';
        if (this.error) this.mostrarMensaje(this.error, 'danger');
        this.dismissLoading();
      }
    );
  }

  getImagen(animal: any): string {
    return this.animalesService.obtenerImagenUrl(animal.foto);
  }

  actualizarPagina() {
    const start = this.currentPageUsuario * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginaActualUsuario = this.filteredAnimalesUsuario.slice(start, end);
  }

  nextPage() {
    if (this.currentPageUsuario < this.totalPagesUsuario - 1) {
      this.currentPageUsuario++;
      this.currentPagehtmlUsuario++;
      this.actualizarPagina();
    }
  }

  prevPage() {
    if (this.currentPageUsuario > 0) {
      this.currentPageUsuario--;
      this.currentPagehtmlUsuario--;
      this.actualizarPagina();
    }
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase().trim() || '';
    this.searchAnimals(query);
  }

  searchAnimals(query: string) {
    this.currentPageUsuario = 0;
    this.currentPagehtmlUsuario = 1;
    if (query === '') {
      this.filteredAnimalesUsuario = [...this.animalesDisponiblesUsuario];
    } else {
      this.filteredAnimalesUsuario = this.animalesDisponiblesUsuario.filter((d: any) =>
        d.nombre_comun.toLowerCase().includes(query)
      );
    }
    this.totalAnimalesUsuario = this.filteredAnimalesUsuario.length;
    this.totalPagesUsuario = Math.ceil(this.totalAnimalesUsuario / this.itemsPerPage);
    this.actualizarPagina();
  }

  cambioFamilia(familia: string | null) {
    if (this.selectedFamilia === familia) {
      this.selectedFamilia = null;
      this.filteredAnimalesUsuario = [...this.animalesDisponiblesUsuario];
    } else {
      this.selectedFamilia = familia;
      this.filteredAnimalesUsuario = this.animalesDisponiblesUsuario.filter((animal: any) => animal.familia === familia);
    }

    this.totalAnimalesUsuario = this.filteredAnimalesUsuario.length;
    this.totalPagesUsuario = Math.ceil(this.totalAnimalesUsuario / this.itemsPerPage);
    this.currentPageUsuario = 0;
    this.currentPagehtmlUsuario = 1;
    this.actualizarPagina();
  }

  isFamiliaSelected(familia: string): boolean {
    return this.selectedFamilia === familia;
  }

  verDetalles(id: string, tipo: string) {
    this.router.navigate(['/detalles-animal', id, tipo]);
  }

  async iniciarAdopcion(animal: any) {
    console.log('AdopcionesPage - iniciarAdopcion - Starting with animal:', animal);
    console.log('AdopcionesPage - iniciarAdopcion - Current userId:', this.userId);

    if (!this.userId) {
      console.error('AdopcionesPage - iniciarAdopcion - No userId found');
      this.mostrarMensaje('Debes iniciar sesión para solicitar una adopción', 'warning');
      this.router.navigate(['/IniciarSesion']);
      return;
    }

    if (!animal || !animal.id) {
      console.error('AdopcionesPage - iniciarAdopcion - Invalid animal data:', animal);
      this.mostrarMensaje('Error: Animal no válido', 'danger');
      return;
    }

    this.selectedAnimal = animal;

    const alert = await this.alertController.create({
      header: 'Solicitar Adopción',
      message: `Estás solicitando la adopción de ${animal.nombre_comun}. Por favor, añade tus comentarios.`,
      inputs: [
        {
          name: 'comentarios',
          type: 'textarea',
          placeholder: 'Comentarios (mínimo 50 caracteres)',
          attributes: {
            rows: 5
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Enviar Solicitud',
          handler: async (data) => {
            const comentarios = data.comentarios.trim();
            if (!comentarios || comentarios.length < 50) {
              this.mostrarMensaje('Los comentarios son requeridos y deben tener al menos 50 caracteres.', 'warning');
              return false;
            }

            await this.presentLoading('Enviando solicitud...');
            this.animalesService.solicitarAdopcion(
              this.selectedAnimal.id,
              this.userId!,
              comentarios
            ).subscribe(
              async (response) => {
                await this.dismissLoading();
                this.mostrarMensaje('Solicitud de adopción enviada correctamente', 'success');
                this.selectedAnimal = null;
                this.cargarAnimalesDisponibles();
              },
              async (error) => {
                await this.dismissLoading();
                console.error('Error submitting adoption request:', error);
                this.mostrarMensaje('Error al enviar la solicitud de adopción. Detalles: ' + (error.error?.message || error.message || 'Error desconocido'), 'danger');
              }
            );
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async cargarDatosEmpresa() {
    this.error = null;
    if (!this.empresaId) {
      this.error = 'ID de empresa no disponible. No se pueden cargar los datos.';
      if (this.error) this.mostrarMensaje(this.error, 'warning');
      await this.dismissLoading();
      return;
    }
    try {
      this.animalesGestionEmpresa = (await this.adopcionesService.getAnimalesEmpresa(this.empresaId).toPromise()) || [];
      this.solicitudes = (await this.adopcionesService.getSolicitudesEmpresa(this.empresaId).toPromise()) || [];
      if (this.animalesGestionEmpresa.length === 0 && this.solicitudes.length === 0) {
        this.mostrarMensaje('No hay animales ni solicitudes para gestionar.', 'tertiary');
      }
    } catch (err: any) {
      console.error('Error cargando datos específicos de la empresa:', err);
      this.error = 'Error cargando animales/solicitudes: ' + (err.message || 'Error desconocido');
      if (this.error) this.mostrarMensaje(this.error, 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  segmentChanged(ev: any) {
    this.segmentModel = ev.detail.value;
  }

  toggleListaAnimalesAdopcion() {
    this.mostrarSoloEnAdopcion = !this.mostrarSoloEnAdopcion;
  }

  getAnimalesParaMostrarEmpresa() {
    if (this.mostrarSoloEnAdopcion) {
      return this.animalesGestionEmpresa.filter(animal => animal.estadoAdopcion === 'DISPONIBLE' || animal.estadoAdopcion === 'EN_ADOPCION');
    }
    return this.animalesGestionEmpresa;
  }

  async cambiarDomestico(animal: any, value: boolean) {
    await this.presentLoading('Actualizando...');
    try {
      await this.adopcionesService.updateDomesticoYEstado(animal.id, value, animal.estadoAdopcion).toPromise();
      animal.isDomestico = value;
      this.mostrarMensaje('Actualizado correctamente', 'success');
    } catch (err) {
      this.mostrarMensaje('Error actualizando estado doméstico', 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async cambiarEstadoAdopcion(animal: any, value: string) {
    await this.presentLoading('Actualizando estado...');
    try {
      await this.adopcionesService.updateDomesticoYEstado(animal.id, animal.isDomestico, value).toPromise();
      animal.estadoAdopcion = value;
      this.mostrarMensaje('Estado de adopción actualizado', 'success');
    } catch (err) {
      this.mostrarMensaje('Error actualizando estado de adopción', 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async responderSolicitud(solicitud: any, nuevoEstado: 'APROBADA' | 'RECHAZADA') {
    await this.presentLoading('Respondiendo solicitud...');
    try {
      await this.adopcionesService.responderSolicitudAdopcion(solicitud.id, nuevoEstado).toPromise();
      this.mostrarMensaje(`Solicitud ${nuevoEstado.toLowerCase()} correctamente.`, 'success');
      await this.cargarDatosEmpresa();
    } catch (err: any) {
      console.error('Error al responder solicitud:', err);
      this.mostrarMensaje('Error al responder la solicitud: ' + (err.message || 'Error desconocido'), 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async presentLoading(message: string) {
    this.loading = true;
    if (this.loadingElement && this.loadingElement.isConnected) {
        this.loadingElement = null;
    }
    if (!this.loadingElement) {
        this.loadingElement = await this.loadingCtrl.create({
            message,
            spinner: 'circles',
        });
        await this.loadingElement.present();
    } else {
        this.loadingElement.message = message;
    }
  }

  async dismissLoading() {
    if (this.loadingElement && this.loadingElement.isConnected) {
        try {
            await this.loadingCtrl.dismiss();
        } catch (e) {
        }
    }
    this.loadingElement = null;
    this.loading = false;
  }

  private async mostrarMensaje(mensaje: string, color: string) {
    if (!mensaje) return;
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
