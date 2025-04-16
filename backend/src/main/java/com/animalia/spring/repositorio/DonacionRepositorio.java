package com.animalia.spring.repositorio;

import com.animalia.spring.entidades.Donacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonacionRepositorio extends JpaRepository<Donacion, Long> {
    List<Donacion> findByEmpresaId(Long empresaId);
    List<Donacion> findByUsuarioId(Long usuarioId);
    List<Donacion> findByEmpresaIdAndDeletedFalse(Long empresaId);
    List<Donacion> findByUsuarioIdAndDeletedFalse(Long usuarioId);
    @Query(value = "SELECT * FROM donaciones ORDER BY fecha DESC LIMIT 10", nativeQuery = true)
    List<Donacion> findRecentDonations();
} 