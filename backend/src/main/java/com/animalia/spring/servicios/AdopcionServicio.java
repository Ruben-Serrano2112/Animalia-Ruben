package com.animalia.spring.servicios;

import com.animalia.spring.entidades.Adopcion;
import com.animalia.spring.entidades.Animales;
import com.animalia.spring.entidades.Usuarios;
import com.animalia.spring.repositorio.AdopcionRepositorio;
import com.animalia.spring.repositorio.AnimalesRepositorio;
import com.animalia.spring.repositorio.UsuarioRepositorio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdopcionServicio {

    @Autowired
    private AdopcionRepositorio adopcionRepositorio;

    @Autowired
    private AnimalesRepositorio animalesRepositorio;

    @Autowired
    private UsuarioRepositorio usuariosRepositorio;

    public Adopcion solicitarAdopcion(Long usuarioId, Long animalId, String comentarios) {
        Animales animal = animalesRepositorio.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal no encontrado"));

        if (!animal.isDomestico() || animal.getEstadoAdopcion() != Animales.EstadoAdopcion.DISPONIBLE) {
            throw new RuntimeException("Este animal no está disponible para adopción");
        }

        Adopcion adopcion = new Adopcion();
        Usuarios u = usuariosRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Animales a = animalesRepositorio.findById(animalId)
                .orElseThrow(() -> new RuntimeException("Animal no encontrado"));
        adopcion.setUsuario(u);
        adopcion.setAnimal(a);
        adopcion.setFechaSolicitud(LocalDateTime.now());
        adopcion.setComentarios(comentarios);
        adopcion.setEstado(Adopcion.EstadoSolicitud.PENDIENTE);
        adopcion.setDeleted(false);

        animal.setEstadoAdopcion(Animales.EstadoAdopcion.EN_PROCESO);
        animalesRepositorio.save(animal);

        return adopcionRepositorio.save(adopcion);
    }

    public Adopcion actualizarEstadoAdopcion(Long adopcionId, Adopcion.EstadoSolicitud nuevoEstado) {
        Adopcion adopcion = adopcionRepositorio.findById(adopcionId)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));

        adopcion.setEstado(nuevoEstado);
        if (nuevoEstado == Adopcion.EstadoSolicitud.APROBADA) {
            adopcion.setFechaAprobacion(LocalDateTime.now());
            Animales animal = animalesRepositorio.findById(adopcion.getAnimal().getId())
                    .orElseThrow(() -> new RuntimeException("Animal no encontrado"));
            animal.setEstadoAdopcion(Animales.EstadoAdopcion.ADOPTADO);
            animalesRepositorio.save(animal);
        }

        return adopcionRepositorio.save(adopcion);
    }

    public List<Adopcion> obtenerAdopcionesPorUsuario(Long usuarioId) {
        return adopcionRepositorio.findByUsuarioIdAndDeletedFalse(usuarioId);
    }

    public List<Adopcion> obtenerAdopcionesPorAnimal(Long animalId) {
        return adopcionRepositorio.findByAnimalIdAndDeletedFalse(animalId);
    }

    public List<Adopcion> obtenerAdopcionesPendientes() {
        return adopcionRepositorio.findByEstadoAndDeletedFalse(Adopcion.EstadoSolicitud.PENDIENTE);
    }

    public void eliminarAdopcion(Long id) {
        Adopcion adopcion = adopcionRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        adopcion.setDeleted(true);
        adopcionRepositorio.save(adopcion);
    }
}
