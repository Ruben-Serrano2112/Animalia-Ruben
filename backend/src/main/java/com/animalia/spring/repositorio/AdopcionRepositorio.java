package com.animalia.spring.repositorio;

import com.animalia.spring.entidades.Adopcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdopcionRepositorio extends JpaRepository<Adopcion, Long> {
    List<Adopcion> findByUsuarioId(Long usuarioId);
    List<Adopcion> findByAnimalId(Long animalId);
    List<Adopcion> findByUsuarioIdAndDeletedFalse(Long usuarioId);
    List<Adopcion> findByAnimalIdAndDeletedFalse(Long animalId);
    List<Adopcion> findByEstadoAndDeletedFalse(Adopcion.EstadoSolicitud estado);
} 