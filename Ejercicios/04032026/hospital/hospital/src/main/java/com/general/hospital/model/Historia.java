package com.general.hospital.model;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Table(name = "History")
public class Historia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String idhistoria;

    @Column(name = "description", nullable = false, length = 100)
    private String descripcion;


    public String getIdhistoria() {
        return idhistoria;
    }

    public void setIdhistoria(String idhistoria) {
        this.idhistoria = idhistoria;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

}
