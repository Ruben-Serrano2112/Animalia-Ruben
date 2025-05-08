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

    // Implementar métodos para:
    // - Solicitar una adopción
    // - Aprobar/rechazar solicitudes
    // - Listar adopciones por usuario
    // - Listar adopciones por animal
    // - Obtener estado de una solicitud

    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitarAdopcion(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("Received request body: " + body);
            
            Long usuarioId = Long.valueOf(body.get("usuario_id").toString());
            Long animalId = Long.valueOf(body.get("animal_id").toString());
            String comentarios = body.get("comentarios") != null ? body.get("comentarios").toString() : "";
            String estado = body.get("estado") != null ? body.get("estado").toString() : "PENDIENTE";
            boolean deleted = body.get("deleted") != null ? Boolean.valueOf(body.get("deleted").toString()) : false;
            
            System.out.println("Processed data: " + 
                "usuarioId=" + usuarioId + 
                ", animalId=" + animalId + 
                ", comentarios=" + comentarios + 
                ", estado=" + estado + 
                ", deleted=" + deleted);
            
            Adopcion adopcion = adopcionServicio.solicitarAdopcion(usuarioId, animalId, comentarios);
            return ResponseEntity.ok(adopcion);
        } catch (RuntimeException e) {
            System.err.println("Error processing request: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al procesar la solicitud de adopción");
        }
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Adopcion>> obtenerSolicitudesPorEmpresa(@PathVariable Long empresaId) {
        List<Adopcion> solicitudes = adopcionServicio.obtenerSolicitudesPorEmpresa(empresaId);
        return ResponseEntity.ok(solicitudes);
    }
} 