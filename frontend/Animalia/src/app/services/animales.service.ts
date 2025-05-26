import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AnimalesService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAnimales(page: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/animales?page=${page}`);
  }
  // Obtener todos los animales para calcular el total de páginas
  getTotalAnimales() {
    return this.http.get<any>(`${this.apiUrl}/animales/todos`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/animales/${id}`);
  }

  obtenerImagenUrl(nombreImagen: string): string {
    return `${this.apiUrl}/imagen/${nombreImagen}`;
  }

  getAnimalesDisponiblesAdopcion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/animales/disponibles-adopcion`);
  }

  solicitarAdopcion(
    animalId: number,
    usuarioId: number,
    comentarios: string,
  ): Observable<any> {
    console.log('AnimalesService - solicitarAdopcion - Input:', {
      animalId,
      usuarioId,
      comentarios,
    });

    const adopcionData = {
      animal_id: animalId,
      usuario_id: usuarioId,
      comentarios: comentarios, // This field was already present
      estado: 'PENDIENTE',
      deleted: false
    };

    console.log('AnimalesService - solicitarAdopcion - Request data:', adopcionData);
    const url = `${this.apiUrl}/adopciones/solicitar`;
    console.log('AnimalesService - solicitarAdopcion - URL:', url);

    return this.http.post<any>(url, adopcionData);
  }

  asignarEmpresa(animalId: number, empresaId: number | null): Observable<any> {
    // El backend debe estar preparado para recibir null como empresaId para desasignar.
    // La URL podría ser algo como /animales/{animalId}/asignar-empresa
    // o un PUT general a /animales/{animalId} con el nuevo empresaId en el body.
    // Por simplicidad, usaré un PUT específico.
    return this.http.put<any>(`${this.apiUrl}/animales/${animalId}/asignar-empresa`, { empresaId });
  }
}
