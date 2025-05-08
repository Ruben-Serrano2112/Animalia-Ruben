import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonacionesService {
  private apiUrl = `${environment.apiUrl}/donaciones`;

  constructor(private http: HttpClient) { }

  realizarDonacion(donacionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, donacionData);
  }

  obtenerDonacionesRecientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recientes`);
  }

  obtenerDonacionesPorEmpresa(empresaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  obtenerTotalDonacionesPorEmpresa(empresaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empresa/${empresaId}/total`);
  }

  obtenerDonacionesPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  obtenerTodasLasDonaciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/todas`);
  }
}
