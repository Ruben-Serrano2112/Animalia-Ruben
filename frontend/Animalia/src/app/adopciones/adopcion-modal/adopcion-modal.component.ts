import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
export class AdopcionModalComponent {
  @Input() animal: any;
  @Input() userId!: number;
  adoptionForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private animalesService: AnimalesService
  ) {
    this.adoptionForm = this.formBuilder.group({
      comentarios: ['', [Validators.required, Validators.minLength(50)]],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  getImagen(animal: any): string {
    return this.animalesService.obtenerImagenUrl(animal.foto);
  }

  dismiss(adopted: boolean = false) {
    this.modalController.dismiss({
      adopted: adopted
    });
  }

  async submitForm() {
    if (this.adoptionForm.valid) {
      const formData = {
        comentarios: this.adoptionForm.get('comentarios')?.value,
        usuarioId: this.userId,
        animalId: this.animal.id
      };

      this.animalesService.solicitarAdopcion(this.animal.id, this.userId).subscribe(
        () => {
          this.dismiss(true);
        },
        (error) => {
          console.error('Error al enviar la solicitud:', error);
        }
      );
    }
  }
}
