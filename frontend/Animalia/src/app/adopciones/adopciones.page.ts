import { Component, OnInit } from '@angular/core';
import { AnimalesService } from '../services/animales.service';
import { Router } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdopcionModalComponent } from './adopcion-modal/adopcion-modal.component';
import { EmpresasService } from '../services/empresas.service'; // Importar EmpresasService

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
  todasLasEmpresas: any[] = []; // Nueva propiedad para almacenar todas las empresas

  userId: number | null = null;
  selectedFamilia: string | null = null;
  adoptionForm: FormGroup;
  showAdoptionForm: boolean = false;
  selectedAnimal: any = null;

  totalAnimales: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  currentPagehtml: number = 1;
  itemsPerPage: number = 5;
  paginaActual: any[] = [];

  constructor(
    private animalesService: AnimalesService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController,
    private usuarioService: UsuarioService,
    private loadingCtrl: LoadingController,
    private empresasService: EmpresasService // Inyectar EmpresasService
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
      this.cargarAnimalesDisponibles(); // Para la pestaña "Solicitar Adopción"
      await this.cargarDatosAdmin(); // Carga animales y solicitudes para las otras pestañas de admin
    } else {
      this.cargarAnimalesDisponibles();
    }
  }

  async cargarDatosAdmin() {
    this.error = null;
    // await this.presentLoading('Cargando datos de administrador...'); // Loading ya se presenta en ngOnInit
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

      this.empresasService.getTotalEmpresas().subscribe( // Cargar todas las empresas
        (empresas: any[]) => {
          this.todasLasEmpresas = empresas;
        },
        (err: any) => {
          console.error('Error cargando todas las empresas para admin:', err);
          this.mostrarMensaje('Error cargando empresas para admin.', 'danger');
        }
      );

      // Quitar la condición que mostraba mensaje si ambas listas estaban vacías,
      // ya que ahora hay una tercera carga (empresas)
      // if (this.animalesGestionAdmin.length === 0 && this.solicitudesAdmin.length === 0) {
      // }
    } catch (err: any) {
      console.error('Error cargando datos de admin:', err);
      this.error = 'Error cargando datos de admin: ' + (err.message || 'Error desconocido');
      if (this.error) this.mostrarMensaje(this.error, 'danger');
    } finally {
      await this.dismissLoading(); // Asegurarse que el loading se cierra después de todas las cargas
    }
  }

  cargarAnimalesDisponibles() {
    this.animalesService.getAnimalesDisponiblesAdopcion().subscribe(
      (animales: any[]) => {
        this.animales = animales.map((animal: any) => ({
          ...animal,
          estado_conservacion: animal.estado_conservacion.replace(/_/g, ' ')
        }));
        this.filteredAnimals = [...this.animales];
        this.totalAnimales = this.filteredAnimals.length;
        this.totalPages = Math.ceil(this.totalAnimales / this.itemsPerPage);
        this.currentPage = 0;
        this.currentPagehtml = 1;
        this.actualizarPagina();
      },
      (error) => {
        console.error('Error al cargar animales:', error);
      }
    );
  }

  getImagen(animal: any): string {
    return this.animalesService.obtenerImagenUrl(animal.foto);
  }

  actualizarPagina() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginaActual = this.filteredAnimals.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.currentPagehtml++;
      this.actualizarPagina();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.currentPagehtml--;
      this.actualizarPagina();
    }
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase().trim() || '';
    this.searchAnimals(query);
  }

  searchAnimals(query: string) {
    this.currentPage = 0;
    if (query === '') {
      this.filteredAnimals = [...this.animales];
    } else {
      this.filteredAnimals = this.animales.filter((d: any) =>
        d.nombre_comun.toLowerCase().includes(query)
      );
    }
    this.actualizarPagina();
  }

  cambioFamilia(familia: string | null) {
    if (this.selectedFamilia === familia) {
      this.selectedFamilia = null;
      this.filteredAnimals = [...this.animales];
    } else {
      this.selectedFamilia = familia;
      this.filteredAnimals = this.animales.filter((animal: any) => animal.familia === familia);
    }

    this.totalAnimales = this.filteredAnimals.length;
    this.totalPages = Math.ceil(this.totalAnimales / this.itemsPerPage);
    this.currentPage = 0;
    this.currentPagehtml = 1;
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

    console.log('AdopcionesPage - iniciarAdopcion - Opening modal with data:', {
      animal: animal,
      userId: this.userId
    });

    const modal = await this.modalController.create({
      component: AdopcionModalComponent,
      componentProps: {
        animal: animal,
        userId: this.userId
      },
      cssClass: 'adoption-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('AdopcionesPage - iniciarAdopcion - Modal dismissed with data:', data);

    if (data?.adopted) {
      console.log('AdopcionesPage - iniciarAdopcion - Reloading animals list');
      this.cargarAnimalesDisponibles();
    }
  }

  async submitAdoptionForm() {
    if (this.adoptionForm.valid && this.selectedAnimal && this.userId) {
      const comentarios = this.adoptionForm.get('comentarios')?.value;

      this.animalesService.solicitarAdopcion(this.selectedAnimal.id, this.userId, comentarios).subscribe(
        async (response) => {
          this.mostrarMensaje('Solicitud de adopción enviada correctamente', 'success');
          this.adoptionForm.reset();
          this.selectedAnimal = null;
          this.cargarAnimalesDisponibles();
        },
        async (error) => {
          this.mostrarMensaje('Error al enviar la solicitud de adopción', 'danger');
        }
      );
    }
  }

  cancelarAdopcion() {
    this.adoptionForm.reset();
    this.selectedAnimal = null;
  }

  private async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
