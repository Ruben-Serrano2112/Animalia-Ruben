import { Component, OnInit } from '@angular/core';
import { AnimalesService } from '../services/animales.service';
import { Router } from '@angular/router';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { UsuarioService } from '../services/usuario.service';
import { AdopcionesService } from '../services/adopciones.service';
import { AdopcionModalComponent } from './adopcion-modal/adopcion-modal.component';
import { EmpresasService } from '../services/empresas.service';

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
  animalesGestionAdmin: any[] = [];
  solicitudesAdmin: any[] = [];
  filteredAnimalesGestionAdmin: any[] = [];
  mostrarSoloEnAdopcionAdmin = false;
  todasLasEmpresas: any[] = [];

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
  adminSegmentModel = 'solicitar';
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
    private empresasService: EmpresasService
  ) {
    const userIdStr = sessionStorage.getItem('id');
    this.userId = userIdStr ? parseInt(userIdStr) : null;
    this.userRol = sessionStorage.getItem('rol');
  }

  async ngOnInit() {
    await this.presentLoading('Cargando...');
    this.userRol = sessionStorage.getItem('rol');

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
    } else if (this.userRol === 'ADMIN') {
      this.cargarAnimalesDisponibles();
      await this.cargarDatosAdmin();
    } else {
      this.cargarAnimalesDisponibles();
    }
  }

  async cargarDatosAdmin() {
    this.error = null;

    try {
      this.animalesService.getTotalAnimales().subscribe(
        (animales: any[]) => {
          this.animalesGestionAdmin = animales.map((animal: any) => {
            let domesticoValue = false;
            if (typeof animal.isDomestico === 'boolean') {
              domesticoValue = animal.isDomestico;
            } else if (typeof animal.domestico === 'boolean') {
              domesticoValue = animal.domestico;
            }
            return {
              ...animal,
              isDomestico: domesticoValue,
              estado_conservacion: animal.estado_conservacion ? animal.estado_conservacion.replace(/_/g, ' ') : 'No especificado'
            };
          });
          this.filteredAnimalesGestionAdmin = [...this.animalesGestionAdmin];
        },
        (err: any) => {
          console.error('Error cargando todos los animales para admin:', err);
          this.mostrarMensaje('Error cargando animales para admin.', 'danger');
        }
      );

      this.adopcionesService.getTodasLasSolicitudes().subscribe(
        (solicitudes: any[]) => {
          this.solicitudesAdmin = solicitudes;
        },
        (err: any) => {
          console.error('Error cargando todas las solicitudes para admin:', err);
          this.mostrarMensaje('Error cargando solicitudes para admin.', 'danger');
        }
      );

      this.empresasService.getTotalEmpresas().subscribe(
        (empresas: any[]) => {
          this.todasLasEmpresas = empresas;
        },
        (err: any) => {
          console.error('Error cargando todas las empresas para admin:', err);
          this.mostrarMensaje('Error cargando empresas para admin.', 'danger');
        }
      );

    } catch (err: any) {
      console.error('Error cargando datos de admin:', err);
      this.error = 'Error cargando datos de admin: ' + (err.message || 'Error desconocido');
      if (this.error) this.mostrarMensaje(this.error, 'danger');
    } finally {
      await this.dismissLoading();
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

    const modal = await this.modalController.create({
      component: AdopcionModalComponent,
      componentProps: {
        animal: this.selectedAnimal,
        userId: this.userId
      },
      cssClass: 'adopcion-modal-css'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.adopted) {
      this.mostrarMensaje('Solicitud de adopción procesada.', 'success');
      this.cargarAnimalesDisponibles();
    }
    this.selectedAnimal = null;
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
      const animalesData = (await this.adopcionesService.getAnimalesEmpresa(this.empresaId).toPromise()) || [];
      this.animalesGestionEmpresa = animalesData.map((animal: any) => {
        let domesticoValue = false;
        if (typeof animal.isDomestico === 'boolean') {
          domesticoValue = animal.isDomestico;
        } else if (typeof animal.domestico === 'boolean') {
          domesticoValue = animal.domestico;
        }
        return {
          ...animal,
          isDomestico: domesticoValue
        };
      });
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

  adminSegmentChanged(ev: any) {
    this.adminSegmentModel = ev.detail.value;
  }

  toggleListaAnimalesAdopcion() {
  }

  toggleListaAnimalesAdopcionAdmin() {
  }

  getAnimalesParaMostrarEmpresa() {
    if (this.mostrarSoloEnAdopcion) {
      return this.animalesGestionEmpresa.filter(animal => animal.estadoAdopcion === 'DISPONIBLE');
    }
    return this.animalesGestionEmpresa;
  }

  getAnimalesParaMostrarAdmin() {
    let animalesFiltrados = this.filteredAnimalesGestionAdmin;
    if (this.mostrarSoloEnAdopcionAdmin) {
      animalesFiltrados = animalesFiltrados.filter(animal => animal.estadoAdopcion === 'DISPONIBLE');
    }
    return animalesFiltrados;
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
      if (nuevoEstado === 'APROBADA') {
        await this.adopcionesService.aprobarSolicitudAdopcion(solicitud.id).toPromise();
      } else if (nuevoEstado === 'RECHAZADA') {
        await this.adopcionesService.rechazarSolicitudAdopcion(solicitud.id).toPromise();
      } else {
        throw new Error('Estado no válido para responder solicitud.');
      }
      const actionText = nuevoEstado === 'APROBADA' ? 'aprobada' : 'rechazada';
      this.mostrarMensaje(`Solicitud ${actionText} correctamente.`, 'success');
      if (this.userRol === 'EMPRESA') {
        await this.cargarDatosEmpresa();
      } else if (this.userRol === 'ADMIN') {
        await this.cargarDatosAdmin();
      }
    } catch (err: any) {
      console.error('Error al responder solicitud:', err);
      this.mostrarMensaje('Error al responder la solicitud: ' + (err.message || 'Error desconocido'), 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async cambiarEmpresaAnimal(animal: any, event: any) {
    const empresaId = event.detail.value;
    if (animal.empresa?.id === empresaId) {
      return;
    }
    await this.presentLoading('Asignando empresa...');
    try {
      await this.animalesService.asignarEmpresa(animal.id, empresaId).toPromise();

      const empresaSeleccionada = empresaId ? this.todasLasEmpresas.find(e => e.id === empresaId) : null;
      animal.empresa = empresaSeleccionada;

      this.mostrarMensaje('Empresa asignada/actualizada correctamente.', 'success');
    } catch (err: any) {
      console.error('Error asignando empresa al animal:', err);
      this.mostrarMensaje('Error asignando empresa: ' + (err.message || 'Error desconocido'), 'danger');
    } finally {
      await this.dismissLoading();
    }
  }

  async presentLoading(message: string) {
    this.loading = true;
    if (this.loadingElement && this.loadingElement.isConnected) {
        return;
    }
    this.loadingElement = await this.loadingCtrl.create({
        message,
        spinner: 'circles',
    });
    await this.loadingElement.present();
  }

  async dismissLoading() {
    if (this.loadingElement && this.loadingElement.parentElement) {
        try {
            await this.loadingElement.dismiss();
        } catch (e) {
            console.warn('Dismiss loading error:', e);
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
