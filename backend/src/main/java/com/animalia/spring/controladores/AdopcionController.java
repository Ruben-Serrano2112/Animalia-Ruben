package com.animalia.spring.controladores;

import com.animalia.spring.servicios.AdopcionServicio;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("api/adopciones")
@Tag(name = "Adopciones", description = "Operaciones relacionadas con adopciones")
public class AdopcionController {
    // Implementar métodos para:
    // - Solicitar una adopción
    // - Aprobar/rechazar solicitudes
    // - Listar adopciones por usuario
    // - Listar adopciones por animal
    // - Obtener estado de una solicitud
} 