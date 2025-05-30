package com.animalia.spring.entidades;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn; // Asegúrate de tener esta importación
import jakarta.persistence.ManyToOne; // Asegúrate de tener esta importación
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.Objects;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "animales")
public class Animales {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String especie;

    @Column(nullable = true)
    private String nombre_comun;

    @Column(nullable = true)
    private String descripcion;
    
    @Column(nullable = true)
    private String foto;
    
    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private EstadoConservacion estado_conservacion;

    
    public enum EstadoConservacion {
        EXTINTO, BAJO_RIESGO, PELIGRO_EXTINCION, SIN_RIESGO
    }

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private Familia familia;

    public enum Familia {
        MAMIFERO, REPTIL, ANFIBIO, AVES, PECES
    }
    
    @Column(nullable = false)
    private boolean deleted = false;

    @Column(nullable = false)
    private boolean isDomestico = false;
    
    @Enumerated(EnumType.STRING)
    private EstadoAdopcion estadoAdopcion = EstadoAdopcion.NO_DISPONIBLE;
    
    @ManyToOne 
    @JoinColumn(name = "empresa_id", nullable = true) 
    private Empresas empresa;

    public enum EstadoAdopcion {
        DISPONIBLE, EN_PROCESO, ADOPTADO, NO_DISPONIBLE
    }

    public Animales(Long id, String especie, String nombre_comun, String descripcion, String foto, 
                   EstadoConservacion estado_conservacion, Familia familia, boolean deleted) {
        this.id = id;
        this.especie = especie;
        this.nombre_comun = nombre_comun;
        this.descripcion = descripcion;
        this.foto = foto;
        this.estado_conservacion = estado_conservacion;
        this.familia = familia;
        this.deleted = deleted;
        this.isDomestico = false;
        this.estadoAdopcion = EstadoAdopcion.NO_DISPONIBLE;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Animales animales = (Animales) o;
        return id.equals(animales.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
}
