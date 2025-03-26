import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donaciones',
  templateUrl: './donaciones.page.html',
  styleUrls: ['./donaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class DonacionesPage implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
