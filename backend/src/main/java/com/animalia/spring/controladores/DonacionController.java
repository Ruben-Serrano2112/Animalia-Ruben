package com.animalia.spring.controladores;

import com.animalia.spring.entidades.Donacion;
import com.animalia.spring.servicios.DonacionServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("api/donaciones")
@Tag(name = "Donaciones", description = "Operaciones relacionadas con donaciones")
public class DonacionController {

    @Autowired
    private DonacionServicio donacionServicio;

    @PostMapping("/crear")
    @Operation(summary = "Crear una nueva donación", description = "Crea una nueva donación para una empresa")
    public ResponseEntity<Donacion> crearDonacion(@RequestBody Donacion donacion) {
        return ResponseEntity.ok(donacionServicio.crearDonacion(donacion.getUsuarioId(), donacion.getEmpresaId(), donacion.getMonto(), donacion.getComentario(), donacion.getMetodoPago()));
    }

    @GetMapping("/recientes")
    @Operation(summary = "Obtener donaciones recientes", description = "Lista las donaciones más recientes")
    public ResponseEntity<List<Donacion>> obtenerDonacionesRecientes() {
        return ResponseEntity.ok(donacionServicio.obtenerDonacionesRecientes());
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Obtener donaciones por empresa", description = "Lista todas las donaciones recibidas por una empresa")
    public ResponseEntity<List<Donacion>> obtenerDonacionesPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(donacionServicio.obtenerDonacionesPorEmpresa(empresaId));
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Obtener donaciones por usuario", description = "Lista todas las donaciones realizadas por un usuario")
    public ResponseEntity<List<Donacion>> obtenerDonacionesPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(donacionServicio.obtenerDonacionesPorUsuario(usuarioId));
    }

    @GetMapping("/empresa/{empresaId}/total")
    @Operation(summary = "Obtener total de donaciones por empresa", description = "Calcula el total de donaciones recibidas por una empresa")
    public ResponseEntity<Double> obtenerTotalDonacionesPorEmpresa(@PathVariable Long empresaId) {
        return ResponseEntity.ok(donacionServicio.obtenerTotalDonacionesPorEmpresa(empresaId));
    }

    @GetMapping("/todas")
    @Operation(summary = "Obtener todas las donaciones", description = "Lista todas las donaciones registradas")
    public ResponseEntity<List<Donacion>> obtenerTodasLasDonaciones() {
        return ResponseEntity.ok(donacionServicio.obtenerTodasLasDonaciones());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar donación", description = "Elimina una donación por su ID")
    public ResponseEntity<Void> eliminarDonacion(@PathVariable Long id) {
        donacionServicio.eliminarDonacion(id);
        return ResponseEntity.noContent().build();
    }
} 