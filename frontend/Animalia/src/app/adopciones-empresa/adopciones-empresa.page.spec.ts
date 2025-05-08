import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdopcionesEmpresaPage } from './adopciones-empresa.page';

describe('AdopcionesEmpresaPage', () => {
  let component: AdopcionesEmpresaPage;
  let fixture: ComponentFixture<AdopcionesEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdopcionesEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
