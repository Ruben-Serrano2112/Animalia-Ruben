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
    
    private String comentario;
    
    @Column(nullable = false)
    private boolean deleted = false;
    
    @Column(nullable = false)
    private LocalDateTime fecha;
    
    @Column(nullable = false)
    private Double monto;
    
    @Column(name = "empresa_id")
    private Long empresaId;
    
    @Column(name = "usuario_id")
    private Long usuarioId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPago metodoPago;
    
    public enum MetodoPago {
        TARJETA_CREDITO,
        TARJETA_DEBITO,
        TRANSFERENCIA,
        PAYPAL
    }

    @PrePersist
    protected void onCreate() {
        fecha = LocalDateTime.now();
    }
} 