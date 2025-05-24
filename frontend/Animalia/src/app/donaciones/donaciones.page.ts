import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import { DonacionesService } from '../services/donaciones.service';
import { EmpresasService } from '../services/empresas.service';
import { UsuarioService } from '../services/usuario.service';

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


  totalEmpresas: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  currentPagehtml: number = 1;
  itemsPerPage: number = 5;
  paginaActual: any[] = [];

  donacionesEmpresa: any[] = [];
  isEmpresa: boolean = false;
  empresaId: number | null = null;
  showDonations: boolean = true;

  donacionesUsuario: any[] = [];
  showUserDonations: boolean = false;

  donacionesAdmin: any[] = [];
  showAdminDonations: boolean = false;

  userRol: string | null = null;
  isAdmin: boolean = false;

  showFormModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private donacionesService: DonacionesService,
    private empresasService: EmpresasService,
    private usuarioService: UsuarioService,
    private modalController: ModalController
  ) {
    this.donationForm = this.formBuilder.group({
      monto: ['', [Validators.required, Validators.min(1)]],
      metodoPago: ['TARJETA_CREDITO', Validators.required],
      comentario: [''],
      empresaId: ['', Validators.required],
      usuarioId: [1]
    });
  }

  ngOnInit() {
    this.userRol = sessionStorage.getItem('rol');
    this.isEmpresa = this.userRol === 'EMPRESA';
    this.isAdmin = this.userRol === 'ADMIN';
    if (this.isAdmin) {
      this.cargarTodasLasDonaciones();
    }
    if (this.isEmpresa) {
      const usuarioId = sessionStorage.getItem('id');
      if (usuarioId) {
        this.usuarioService.getEmpresaIdByUsuarioId(usuarioId).subscribe(empresaId => {
          this.empresaId = Number(empresaId);
          console.log('EmpresaId detectado (endpoint):', this.empresaId);
          if (this.empresaId) {
            this.cargarDonacionesEmpresa(this.empresaId);
          }
        });
      }
    }
    this.cargarDonacionesRecientes();
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.empresasService.getTotalEmpresas().subscribe(
      (empresas) => {
        if (this.isEmpresa && this.empresaId) {
          this.empresas = empresas.filter((e: any) => e.id !== this.empresaId);
        } else {
          this.empresas = empresas;
        }
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

  async cargarDonacionesEmpresa(empresaId: number) {
    this.donacionesService.obtenerDonacionesPorEmpresa(empresaId).subscribe(async (donaciones) => {
      console.log('Donaciones recibidas:', donaciones);
      this.donacionesEmpresa = await Promise.all(donaciones.map(async (donacion: any) => {
        let usuarioNombre = '';
        if (donacion.usuarioId) {
          try {
            const usuario = await this.usuarioService.getUsuarioById(donacion.usuarioId).toPromise();
            usuarioNombre = usuario?.nombre + ' ' + (usuario?.apellido || '');
          } catch {
            usuarioNombre = 'Usuario';
          }
        }
        return { ...donacion, usuarioNombre };
      }));
      console.log('Donaciones para mostrar:', this.donacionesEmpresa);
    });
  }

  async abrirFormularioDonacion() {
    this.showFormModal = true;
  }

  cerrarFormularioDonacion() {
    this.showFormModal = false;
    if (this.isAdmin) this.showAdminDonations = true;
    if (this.isEmpresa) this.showDonations = true;
  }

  async verMisDonaciones() {
    const currentUsuarioIdString = sessionStorage.getItem('id');
    if (currentUsuarioIdString) {
      const currentUsuarioId = Number(currentUsuarioIdString);
      this.donacionesService.obtenerDonacionesPorUsuario(currentUsuarioId).subscribe(async (allFetchedDonations: any[]) => {

        const userSpecificDonations = allFetchedDonations.filter(donacion => donacion.usuarioId === currentUsuarioId);

        this.donacionesUsuario = await Promise.all(userSpecificDonations.map(async (donacion: any) => {
          let nombreEmpresa = '';
          if (donacion.empresaId) {
            try {
              const empresa = await this.empresasService.getById(donacion.empresaId).toPromise();
              nombreEmpresa = empresa?.nombre || ('empresa #' + donacion.empresaId) ;
            } catch (error) {
              console.error('Error fetching empresa details for donacion:', donacion.id, error);
              nombreEmpresa = 'empresa #' + donacion.empresaId;
            }
          }
          return { ...donacion, nombreEmpresa };
        }));
        this.showUserDonations = true;
      });
    }
  }

  volverAlFormulario() {
    this.showUserDonations = false;
  }

  cargarTodasLasDonaciones() {
    this.donacionesService.obtenerTodasLasDonaciones().subscribe(async (donaciones: any[]) => {
      this.donacionesAdmin = await Promise.all(donaciones.map(async (donacion: any) => {
        let usuarioNombre = '';
        let empresaNombre = '';
        if (donacion.usuarioId) {
          try {
            const usuario = await this.usuarioService.getUsuarioById(donacion.usuarioId).toPromise();
            usuarioNombre = usuario?.nombre + ' ' + (usuario?.apellido || '');
          } catch {
            usuarioNombre = 'Usuario';
          }
        }
        if (donacion.empresaId) {
          try {
            const empresa = await this.empresasService.getById(donacion.empresaId).toPromise();
            empresaNombre = empresa?.nombre || 'Empresa';
          } catch {
            empresaNombre = 'Empresa';
          }
        }
        return { ...donacion, usuarioNombre, empresaNombre };
      }));
      this.showAdminDonations = true;
    });
  }
}
