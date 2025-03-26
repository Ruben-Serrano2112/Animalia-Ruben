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
@Table(name = "donaciones")
public class Donacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;
    
    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresas empresa;
    
    @Column(nullable = false)
    private Double monto;
    
    @Column(nullable = false)
    private LocalDateTime fecha;
    
    private String comentario;
    
    @Column(nullable = false)
    private boolean deleted = false;
} 