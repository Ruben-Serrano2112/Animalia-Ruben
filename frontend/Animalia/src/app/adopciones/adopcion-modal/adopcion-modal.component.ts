import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController, NavParams } from '@ionic/angular';
import { AnimalesService } from '../../services/animales.service';
// import { UsuarioService } from '../../services/usuario.service'; // UsuarioService may not be needed if userId is passed directly
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
    private fb: FormBuilder,
    private animalesService: AnimalesService,
    // private usuarioService: UsuarioService, // UsuarioService may not be needed if userId is passed directly
    private toastController: ToastController,
    private navParams: NavParams // Para recibir datos en el modal
  ) {
    this.adoptionForm = this.fb.group({
      comentarios: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
    this.animal = this.navParams.get('animal');
    this.userId = this.navParams.get('userId'); // Get userId from navParams

    // Log received parameters for debugging
    console.log('AdopcionModalComponent - Constructor - NavParams:', {
      animal: this.animal,
      userId: this.userId
    });

    if (!this.userId) {
      console.error('Usuario ID no recibido a través de NavParams. El modal de adopción no puede funcionar correctamente.');
      // Optionally, show a message and dismiss, or handle as an error state
      this.mostrarMensaje('Error: No se pudo obtener el ID del usuario para el modal.', 'danger');
      this.dismiss(); // Dismiss if critical info is missing
    }
  }

  ngOnInit() {
    // If @Input userId is preferred, ensure it's prioritized or merged with navParams
    // For now, constructor handles navParams. Logging to see if @Input is also set.
    console.log('AdopcionModalComponent - ngOnInit - @Input values:', {
      animal: this.animal, // this.animal is also set from navParams in constructor
      userId: this.userId  // this.userId is also set from navParams in constructor
    });
    if (!this.animal) {
        this.animal = this.navParams.get('animal');
    }
    if (!this.userId) {
        this.userId = this.navParams.get('userId');
        if (!this.userId) {
            console.error('UserID not available in ngOnInit either.');
            this.mostrarMensaje('Error crítico: UserID no disponible.', 'danger');
            this.dismiss();
        }
    }
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
    console.log('AdopcionModalComponent - submitForm called');
    if (this.adoptionForm.valid) {
      const comentarios = this.adoptionForm.value.comentarios;
      console.log('AdopcionModalComponent - Form is valid. Comentarios:', comentarios);

      if (!this.animal || !this.animal.id) {
        console.error('AdopcionModalComponent - submitForm - Error: Animal data is missing.');
        this.mostrarMensaje('Error: Datos del animal no disponibles.', 'danger');
        return;
      }
      if (!this.userId) {
        console.error('AdopcionModalComponent - submitForm - Error: User ID is missing.');
        this.mostrarMensaje('Error: ID de usuario no disponible.', 'danger');
        return;
      }

      this.isLoading = true;
      console.log('AdopcionModalComponent - submitForm - Sending request with data:', {
        animal_id: this.animal.id,
        usuario_id: this.userId,
        comentarios: comentarios
      });

      this.animalesService.solicitarAdopcion(
        this.animal.id,
        this.userId,
        comentarios
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
