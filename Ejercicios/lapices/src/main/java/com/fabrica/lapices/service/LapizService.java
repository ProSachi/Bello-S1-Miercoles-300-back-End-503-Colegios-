package com.fabrica.lapices.service;

import com.fabrica.lapices.model.Lapiz;
import com.fabrica.lapices.repository.LapizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LapizService {

    private final LapizRepository lapizRepository;

    public LapizService(LapizRepository lapizRepository) {
        this.lapizRepository = lapizRepository;
    }

    public List<Lapiz> listarTodos() {
        return lapizRepository.findAll();
    }

    public Optional<Lapiz> obtenerPorId(Long id) {
        return lapizRepository.findById(id);
    }

    public Lapiz crear(Lapiz lapiz) {
        lapiz.setId(null);
        return lapizRepository.save(lapiz);
    }

    public Optional<Lapiz> actualizar(Long id, Lapiz lapizActualizado) {
        return lapizRepository.findById(id).map(lapizExistente -> {
            lapizExistente.setMarca(lapizActualizado.getMarca());
            lapizExistente.setTipo(lapizActualizado.getTipo());
            lapizExistente.setColor(lapizActualizado.getColor());
            lapizExistente.setPrecio(lapizActualizado.getPrecio());
            lapizExistente.setStock(lapizActualizado.getStock());
            return lapizRepository.save(lapizExistente);
        });
    }

    public boolean eliminar(Long id) {
        if (!lapizRepository.existsById(id)) {
            return false;
        }

        lapizRepository.deleteById(id);
        return true;
    }
}
