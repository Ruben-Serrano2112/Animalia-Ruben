import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdopcionesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnimalesEmpresa(empresaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/animales/empresa/${empresaId}`);
  }

  updateDomesticoYEstado(animalId: number, isDomestico: boolean, estadoAdopcion: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/animales/${animalId}/domestico`, {
      isDomestico,
      estadoAdopcion
    });
  }

  getSolicitudesEmpresa(empresaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/adopciones/empresa/${empresaId}`);
  }

  aprobarSolicitudAdopcion(solicitudId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/adopciones/${solicitudId}/aprobar`, {});
  }

  rechazarSolicitudAdopcion(solicitudId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/adopciones/${solicitudId}/rechazar`, {});
  }

  getTodasLasSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/adopciones/todas`);
  }
}
