import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DonacionesService } from '../services/donaciones.service';
import { EmpresasService } from '../services/empresas.service';

@Component({
  selector: 'app-donaciones-form-modal',
  templateUrl: './donaciones-form-modal.component.html',
  styleUrls: ['./donaciones-form-modal.component.scss'],
  standalone: true
})
export class DonacionesFormModalComponent {
  @Input() empresas: any[] = [];
  @Input() filteredEmpresas: any[] = [];
  @Input() predefinedAmounts: number[] = [10, 20, 50, 100];
  @Input() paymentMethods: any[] = [];
  @Input() usuarioId: number | null = null;

  donationForm: FormGroup;
  selectedAmount: string = 'custom';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private donacionesService: DonacionesService,
    private empresasService: EmpresasService
  ) {
    this.donationForm = this.formBuilder.group({
      monto: ['', [Validators.required, Validators.min(1)]],
      metodoPago: ['TARJETA_CREDITO', Validators.required],
      comentario: [''],
      empresaId: ['', Validators.required],
      usuarioId: [this.usuarioId]
    });
  }

  selectAmount(amount: number) {
    this.selectedAmount = amount.toString();
    this.donationForm.patchValue({ monto: amount });
  }

  async submitDonation() {
    if (this.donationForm.valid) {
      const donationData = this.donationForm.value;
      this.donacionesService.realizarDonacion(donationData).subscribe(
        async (response) => {
          this.dismiss(true);
        },
        async (error) => {
          this.dismiss(false);
        }
      );
    }
  }

  dismiss(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
