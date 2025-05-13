package com.animalia.spring.controladores;

import com.animalia.spring.servicios.AdopcionServicio;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import com.animalia.spring.entidades.Adopcion;
import java.util.List;

@RestController
@RequestMapping("/api/adopciones")
@Tag(name = "Adopciones", description = "Operaciones relacionadas con adopciones")
@CrossOrigin(origins = "*")
public class AdopcionController {
    @Autowired
    private AdopcionServicio adopcionServicio;

    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitarAdopcion(@RequestBody Map<String, Object> body) {
        try {
            
            Long usuarioId = Long.valueOf(body.get("usuario_id").toString());
            Long animalId = Long.valueOf(body.get("animal_id").toString());
            String comentarios = body.get("comentarios") != null ? body.get("comentarios").toString() : "";
            
            Adopcion adopcion = adopcionServicio.solicitarAdopcion(usuarioId, animalId, comentarios);
            return ResponseEntity.ok(adopcion);
        } catch (RuntimeException e) {
            System.err.println("Error processing /solicitar request: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error in /solicitar: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body("Error al procesar la solicitud de adopción");
        }
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<?> obtenerSolicitudesPorEmpresa(@PathVariable Long empresaId) { // Changed return type to ResponseEntity<?>
        try {
            List<Adopcion> solicitudes = adopcionServicio.obtenerSolicitudesPorEmpresa(empresaId);
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            System.err.println("Error fetching solicitudes for empresa " + empresaId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener solicitudes de la empresa."); // This is now valid
        }
    }

    @PutMapping("/{solicitudId}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long solicitudId) {
        try {
            Adopcion adopcionActualizada = adopcionServicio.actualizarEstadoAdopcion(solicitudId, Adopcion.EstadoSolicitud.APROBADA);
            return ResponseEntity.ok(adopcionActualizada);
        } catch (RuntimeException e) {
            System.err.println("Error al aprobar solicitud " + solicitudId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error inesperado al aprobar solicitud " + solicitudId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error inesperado al procesar la aprobación de la solicitud.");
        }
    }

    @PutMapping("/{solicitudId}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(@PathVariable Long solicitudId) {
        try {
            Adopcion adopcionActualizada = adopcionServicio.actualizarEstadoAdopcion(solicitudId, Adopcion.EstadoSolicitud.RECHAZADA);
            return ResponseEntity.ok(adopcionActualizada);
        } catch (RuntimeException e) {
            System.err.println("Error al rechazar solicitud " + solicitudId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error inesperado al rechazar solicitud " + solicitudId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error inesperado al procesar el rechazo de la solicitud.");
        }
    }

    @GetMapping("/todas")
    public ResponseEntity<?> obtenerTodasLasSolicitudes() {
        try {
            List<Adopcion> solicitudes = adopcionServicio.obtenerTodasLasSolicitudes();
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            System.err.println("Error al obtener todas las solicitudes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al obtener todas las solicitudes.");
        }
    }
}