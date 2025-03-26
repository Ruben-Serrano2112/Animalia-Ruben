package com.animalia.spring.servicios;

import com.animalia.spring.entidades.Donacion;
import com.animalia.spring.entidades.Empresas;
import com.animalia.spring.entidades.Usuarios;
import com.animalia.spring.repositorio.DonacionRepositorio;
import com.animalia.spring.repositorio.EmpresasRepositorio;
import com.animalia.spring.repositorio.UsuarioRepositorio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonacionServicio {

    @Autowired
    private DonacionRepositorio donacionRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private EmpresasRepositorio empresaRepositorio;

    public Donacion crearDonacion(Long usuarioId, Long empresaId, Double monto, String comentario) {
        Donacion donacion = new Donacion();
        Usuarios u = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Empresas e = empresaRepositorio.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        donacion.setUsuario(u);
        donacion.setEmpresa(e);
        donacion.setMonto(monto);
        donacion.setComentario(comentario);
        donacion.setFecha(LocalDateTime.now());
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
}
