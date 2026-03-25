package com.hospital.control.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Table(name = "varios")
@Entity
public class Varios extends Persona {

    @Column(nullable = false, length = 10)
    private String piso;

    public Varios(String piso) {
        this.piso = piso;
    }

    public Varios(int id, String nombre, String apellido, String piso) {
        super(id, nombre, apellido);
        this.piso = piso;
    }

    public String getPiso() {
        return piso;
    }

    public void setPiso(String piso) {
        this.piso = piso;
    }

}
