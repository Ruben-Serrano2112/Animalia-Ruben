package com.animalia.spring.repositorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.animalia.spring.entidades.Animales;

@Repository
public interface AnimalesRepositorio extends JpaRepository<Animales, Long> {

    @Query("SELECT a FROM Animales a WHERE a.deleted = false")
    List<Animales> findAllActive();

    @Query("SELECT a FROM Animales a WHERE a.deleted = false")
    Page<Animales> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Animales a WHERE a.id = :id AND a.deleted = false")
    Optional<Animales> findByIdActive(Long id);

    List<Animales> findByEstadoAdopcionAndDeletedFalse(Animales.EstadoAdopcion estadoAdopcion);

    @Query("SELECT a FROM Animales a WHERE a.estadoAdopcion = :estadoAdopcion AND a.deleted = false AND a.isDomestico = true")
    List<Animales> findByEstadoAdopcionAndDeletedFalseAndIsDomesticoTrue(Animales.EstadoAdopcion estadoAdopcion);

    @Query("SELECT a FROM Animales a WHERE a.empresa.id = :empresaId AND a.deleted = false")
    List<Animales> findByEmpresaIdAndDeletedFalse(Long empresaId);
}
