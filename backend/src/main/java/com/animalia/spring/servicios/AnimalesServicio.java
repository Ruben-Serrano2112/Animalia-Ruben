package com.animalia.spring.servicios;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.animalia.spring.entidades.Animales;
import com.animalia.spring.entidades.Empresas;
import com.animalia.spring.repositorio.AnimalesRepositorio;
import com.animalia.spring.repositorio.EmpresasRepositorio;

@Service
public class AnimalesServicio {

    @Autowired
    private AnimalesRepositorio animalesRepositorio;

    @Autowired
    private EmpresasRepositorio empresaRepository;

    public List<Animales> obtenerAnimales() {
        return animalesRepositorio.findAllActive();
    }

    public List<Animales> obtenerTodosLosAnimales() {
        return animalesRepositorio.findAll();
    }

    public Page<Animales> obtenerAnimalesPaginacion(Pageable pageable) {
        return animalesRepositorio.findAllActive(pageable);
    }

    public Animales obtenerAnimalPorId(long id) {
        return animalesRepositorio.findByIdActive(id).orElse(null);
    }

    public Animales guardarAnimal(Animales animal) {
        return animalesRepositorio.save(animal);
    }

    public void eliminarAnimal(long id) {
        Animales animal = animalesRepositorio.findById(id).orElse(null);
        if (animal != null) {
            animal.setDeleted(true);
            animalesRepositorio.save(animal);
        }
    }

    public Animales actualizarAnimal(Animales animal) {
        return animalesRepositorio.save(animal);
    }

    public List<Animales> obtenerAnimalesDisponiblesAdopcion() {
        return animalesRepositorio.findByEstadoAdopcionAndDeletedFalseAndIsDomesticoTrue(Animales.EstadoAdopcion.DISPONIBLE);
    }

    public Animales solicitarAdopcion(Long animalId, Long usuarioId) {
        Animales animal = obtenerAnimalPorId(animalId);
        if (animal != null && animal.getEstadoAdopcion() == Animales.EstadoAdopcion.DISPONIBLE) {
            animal.setEstadoAdopcion(Animales.EstadoAdopcion.EN_PROCESO);
            return animalesRepositorio.save(animal);
        }
        throw new RuntimeException("Animal no disponible para adopción");
    }

    public List<Animales> obtenerAnimalesPorEmpresa(Long empresaId) {
        return animalesRepositorio.findByEmpresaIdAndDeletedFalse(empresaId);
    }

    public Animales actualizarDomesticoYEstado(Long animalId, boolean isDomestico, Animales.EstadoAdopcion estadoAdopcion) {
        Animales animal = animalesRepositorio.findById(animalId).orElseThrow(() -> new RuntimeException("Animal no encontrado"));
        animal.setDomestico(isDomestico);
        animal.setEstadoAdopcion(estadoAdopcion);
        return animalesRepositorio.save(animal);
    }

    public Animales asignarEmpresaAAnimal(Long id_animal, Long id_empresa) {

        Animales animal = obtenerAnimalPorId(id_animal);
        if (animal == null) {
            throw new com.animalia.spring.Excepciones.AnimalNoEcontrada();
        }
            Empresas empresa = empresaRepository.findById(id_empresa)
            .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        animal.setEmpresa(empresa);
        return animalesRepositorio.save(animal);
    }
}
