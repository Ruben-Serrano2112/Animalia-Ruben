import { Component, OnInit } from '@angular/core';
import { AnimalesService } from '../services/animales.service';
import { Router } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdopcionModalComponent } from './adopcion-modal/adopcion-modal.component';

@Component({
  selector: 'app-adopciones',
  templateUrl: './adopciones.page.html',
  styleUrls: ['./adopciones.page.scss'],
  standalone: false
})
export class AdopcionesPage implements OnInit {
  animales: any[] = [];
  filteredAnimals: any[] = [];
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
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    const userIdStr = sessionStorage.getItem('id');
    this.userId = userIdStr ? parseInt(userIdStr) : null;

    this.adoptionForm = this.formBuilder.group({
      comentarios: ['', [Validators.required, Validators.minLength(50)]],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.cargarAnimalesDisponibles();
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
