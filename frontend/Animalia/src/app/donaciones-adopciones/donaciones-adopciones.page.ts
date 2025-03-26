import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-donaciones-adopciones',
  templateUrl: './donaciones-adopciones.page.html',
  styleUrls: ['./donaciones-adopciones.page.scss'],
})
export class DonacionesAdopcionesPage implements OnInit {
  segment: string = 'donaciones';

  constructor() { }

  ngOnInit() {
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }
}