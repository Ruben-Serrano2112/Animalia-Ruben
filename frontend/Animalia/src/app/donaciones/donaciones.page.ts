import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { DonacionesService } from '../services/donaciones.service';
import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'app-donaciones',
  templateUrl: './donaciones.page.html',
  styleUrls: ['./donaciones.page.scss'],
  standalone: false
})
export class DonacionesPage implements OnInit {
  donationForm: FormGroup;
  selectedAmount: string = 'custom';
  predefinedAmounts = [10, 20, 50, 100];
  paymentMethods = [
    { id: 'TARJETA_CREDITO', name: 'Tarjeta de crédito', icon: 'card' },
    { id: 'TARJETA_DEBITO', name: 'Tarjeta de débito', icon: 'card-outline' },
    { id: 'PAYPAL', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'TRANSFERENCIA', name: 'Transferencia bancaria', icon: 'cash' }
  ];
  donacionesRecientes: any[] = [];
  empresas: any[] = [];
  filteredEmpresas: any[] = [];
  selectedTipo: string | null = null;

  // Paginación
  totalEmpresas: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  currentPagehtml: number = 1;
  itemsPerPage: number = 5;
  paginaActual: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private donacionesService: DonacionesService,
    private empresasService: EmpresasService
  ) {
    this.donationForm = this.formBuilder.group({
      monto: ['', [Validators.required, Validators.min(1)]],
      metodoPago: ['TARJETA_CREDITO', Validators.required],
      comentario: [''],
      empresaId: ['', Validators.required],
      usuarioId: [1] // Temporal: Deberías obtener el ID del usuario logueado
    });
  }

  ngOnInit() {
    this.cargarDonacionesRecientes();
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.empresasService.getTotalEmpresas().subscribe(
      (empresas) => {
        this.empresas = empresas;
        this.filteredEmpresas = [...this.empresas];
        this.totalEmpresas = this.filteredEmpresas.length;
        this.totalPages = Math.ceil(this.totalEmpresas / this.itemsPerPage);
        this.currentPage = 0;
        this.currentPagehtml = 1;
        this.actualizarPagina();
      },
      (error) => {
        console.error('Error al cargar empresas:', error);
      }
    );
  }

  actualizarPagina() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginaActual = this.filteredEmpresas.slice(start, end);
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

  cargarDonacionesRecientes() {
    this.donacionesService.obtenerDonacionesRecientes().subscribe(
      (donaciones) => {
        this.donacionesRecientes = donaciones;
      },
      (error) => {
        console.error('Error al cargar donaciones recientes:', error);
      }
    );
  }

  selectAmount(amount: number) {
    this.selectedAmount = amount.toString();
    this.donationForm.patchValue({ monto: amount });
  }

  cambioTipo(tipo: string) {
    if (this.selectedTipo === tipo) {
      this.selectedTipo = null;
      this.filteredEmpresas = [...this.empresas];
    } else {
      this.selectedTipo = tipo;
      this.filteredEmpresas = this.empresas.filter((empresa: any) => empresa.tipo === tipo);
    }
    this.currentPage = 0;
    this.actualizarPagina();
  }

  isEmpresaSelected(tipo: string): boolean {
    return this.selectedTipo === tipo;
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase().trim() || '';
    this.searchEmpresas(query);
  }

  searchEmpresas(query: string) {
    this.currentPage = 0;
    if (query === '') {
      this.filteredEmpresas = [...this.empresas];
    } else {
      this.filteredEmpresas = this.empresas.filter((empresa: any) =>
        empresa.nombre.toLowerCase().includes(query)
      );
    }
    this.actualizarPagina();
  }

  async submitDonation() {
    if (this.donationForm.valid) {
      const donationData = this.donationForm.value;

      this.donacionesService.realizarDonacion(donationData).subscribe(
        async (response) => {
          const toast = await this.toastController.create({
            message: '¡Gracias por tu donación!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          toast.present();

          this.donationForm.reset({
            metodoPago: 'TARJETA_CREDITO',
            usuarioId: 1
          });
          this.selectedAmount = 'custom';
          this.cargarDonacionesRecientes();
        },
        async (error) => {
          const toast = await this.toastController.create({
            message: 'Error al procesar la donación. Por favor, inténtalo de nuevo.',
            duration: 2000,
            color: 'danger',
            position: 'top'
          });
          toast.present();
        }
      );
    } else {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos requeridos.',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      toast.present();
    }
  }
}
