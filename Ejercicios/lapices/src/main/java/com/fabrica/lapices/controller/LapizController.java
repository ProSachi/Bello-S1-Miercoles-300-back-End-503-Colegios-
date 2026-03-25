package com.fabrica.lapices.controller;

import com.fabrica.lapices.model.Lapiz;
import com.fabrica.lapices.service.LapizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lapices")
public class LapizController {

    private final LapizService lapizService;

    public LapizController(LapizService lapizService) {
        this.lapizService = lapizService;
    }

    @GetMapping
    public List<Lapiz> listarTodos() {
        return lapizService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lapiz> obtenerPorId(@PathVariable Long id) {
        return lapizService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Lapiz> crear(@RequestBody Lapiz lapiz) {
        Lapiz lapizCreado = lapizService.crear(lapiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(lapizCreado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lapiz> actualizar(@PathVariable Long id, @RequestBody Lapiz lapiz) {
        return lapizService.actualizar(id, lapiz)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        boolean eliminado = lapizService.eliminar(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
