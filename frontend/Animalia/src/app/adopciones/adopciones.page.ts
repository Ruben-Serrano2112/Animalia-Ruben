import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adopciones',
  templateUrl: './adopciones.page.html',
  styleUrls: ['./adopciones.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class AdopcionesPage implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
