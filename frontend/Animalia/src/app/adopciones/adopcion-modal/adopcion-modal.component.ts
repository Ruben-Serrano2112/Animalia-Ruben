import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AnimalesService } from '../../services/animales.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-adopcion-modal',
  templateUrl: './adopcion-modal.component.html',
  styleUrls: ['./adopcion-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class AdopcionModalComponent implements OnInit {
  @Input() animal: any;
  @Input() userId!: number;
  adoptionForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private animalesService: AnimalesService,
    private toastController: ToastController
  ) {
    console.log('AdopcionModalComponent - Constructor - Inputs:', {
      animal: this.animal,
      userId: this.userId
    });

    this.adoptionForm = this.formBuilder.group({
      comentarios: ['', [Validators.required, Validators.minLength(50)]],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    console.log('AdopcionModalComponent - ngOnInit - Inputs:', {
      animal: this.animal,
      userId: this.userId
    });
  }

  getImagen(animal: any): string {
    console.log('AdopcionModalComponent - getImagen - Input:', animal);
    return this.animalesService.obtenerImagenUrl(animal.foto);
  }

  dismiss(adopted: boolean = false) {
    console.log('AdopcionModalComponent - dismiss - Called with:', adopted);
    this.modalController.dismiss({
      adopted: adopted
    });
  }

  async submitForm() {
    console.log('AdopcionModalComponent - submitForm - Starting submission');
    console.log('AdopcionModalComponent - submitForm - Form valid:', this.adoptionForm.valid);
    console.log('AdopcionModalComponent - submitForm - Animal:', this.animal);
    console.log('AdopcionModalComponent - submitForm - UserId:', this.userId);

    if (this.adoptionForm.valid && this.animal && this.userId) {
      this.isLoading = true;
      const comentarios = this.adoptionForm.get('comentarios')?.value;
      console.log('AdopcionModalComponent - submitForm - Comentarios:', comentarios);

      if (!comentarios || !this.animal.id || !this.userId) {
        console.error('AdopcionModalComponent - submitForm - Missing required data:', {
          comentarios,
          animalId: this.animal?.id,
          userId: this.userId
        });
        this.mostrarMensaje('Faltan datos necesarios para la solicitud', 'danger');
        this.isLoading = false;
        return;
      }

      console.log('AdopcionModalComponent - submitForm - Sending request with data:', {
        animal_id: this.animal.id,
        usuario_id: this.userId,
        comentarios: comentarios
      });

      this.animalesService.solicitarAdopcion(
        this.animal.id,            // animalId
        this.userId,               // usuarioId
        comentarios,               // comentarios
        '',                        // nombre (placeholder)
        '',                        // apellidos (placeholder)
        '',                        // telefono (placeholder)
        '',                        // email (placeholder)
        '',                        // direccion (placeholder)
        '',                        // motivo (placeholder)
        false,                     // experienciaPrevia (placeholder)
        false                      // tieneOtrasMascotas (placeholder)
      ).subscribe({
        next: (response) => {
          console.log('AdopcionModalComponent - submitForm - Success response:', response);
          this.mostrarMensaje('Solicitud de adopción enviada correctamente', 'success');
          this.dismiss(true);
        },
        error: (error) => {
          console.error('AdopcionModalComponent - submitForm - Error details:', {
            error,
            errorMessage: error.message,
            errorResponse: error.error
          });
          let mensaje = 'Error al enviar la solicitud de adopción';
          if (error.error) {
            mensaje = error.error;
          }
          this.mostrarMensaje(mensaje, 'danger');
          this.isLoading = false;
        }
      });
    } else {
      console.error('AdopcionModalComponent - submitForm - Form validation failed:', {
        formValid: this.adoptionForm.valid,
        animalExists: !!this.animal,
        userIdExists: !!this.userId
      });
      this.mostrarMensaje('Por favor, completa todos los campos requeridos', 'warning');
    }
  }

  private async mostrarMensaje(mensaje: string, color: string) {
    console.log('AdopcionModalComponent - mostrarMensaje:', { mensaje, color });
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
