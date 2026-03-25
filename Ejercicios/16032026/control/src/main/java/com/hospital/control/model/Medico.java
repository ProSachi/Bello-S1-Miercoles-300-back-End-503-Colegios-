package com.hospital.control.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Table(name = "Medicos")
@Entity
public class Medico extends Persona {
    
    @Column(name = "gerencia", nullable = false, length = 100)
    private String gerencia;

    public Medico(String gerencia) {
        this.gerencia = gerencia;
    }

    public Medico(int id, String nombre, String apellido, String gerencia) {
        super(id, nombre, apellido);
        this.gerencia = gerencia;
    }

    public String getGerencia() {
        return gerencia;
    }

    public void setGerencia(String gerencia) {
        this.gerencia = gerencia;
    }

}
