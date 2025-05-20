package com.animalia.spring.entidades;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "adopciones")
public class Adopcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;
    
    @ManyToOne
    @JoinColumn(name = "animal_id", nullable = false)
    private Animales animal;
    
    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;
    
    private LocalDateTime fechaAprobacion;
    
    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;
    
    @Column(length = 2000)
    private String comentarios;
    
    @Column(nullable = false)
    private boolean deleted = false;

    
    public enum EstadoSolicitud {
        PENDIENTE, APROBADA, RECHAZADA, CANCELADA
    }
} 