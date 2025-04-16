package com.animalia.spring.servicios;

import com.animalia.spring.entidades.Donacion;
import com.animalia.spring.repositorio.DonacionRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonacionServicio {

    @Autowired
    private DonacionRepositorio donacionRepositorio;

    public Donacion crearDonacion(Long usuarioId, Long empresaId, Double monto, String comentario, Donacion.MetodoPago metodoPago) {
        Donacion donacion = new Donacion();
        donacion.setUsuarioId(usuarioId);
        donacion.setEmpresaId(empresaId);
        donacion.setMonto(monto);
        donacion.setComentario(comentario);
        donacion.setFecha(LocalDateTime.now());
        donacion.setMetodoPago(metodoPago);
        donacion.setDeleted(false);
        return donacionRepositorio.save(donacion);
    }

    public List<Donacion> obtenerDonacionesPorEmpresa(Long empresaId) {
        return donacionRepositorio.findByEmpresaIdAndDeletedFalse(empresaId);
    }

    public List<Donacion> obtenerDonacionesPorUsuario(Long usuarioId) {
        return donacionRepositorio.findByUsuarioIdAndDeletedFalse(usuarioId);
    }

    public Double obtenerTotalDonacionesPorEmpresa(Long empresaId) {
        return donacionRepositorio.findByEmpresaIdAndDeletedFalse(empresaId)
                .stream()
                .mapToDouble(Donacion::getMonto)
                .sum();
    }

    public void eliminarDonacion(Long id) {
        Donacion donacion = donacionRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Donación no encontrada"));
        donacion.setDeleted(true);
        donacionRepositorio.save(donacion);
    }

    public List<Donacion> obtenerDonacionesRecientes() {
        return donacionRepositorio.findRecentDonations();
    }
}
