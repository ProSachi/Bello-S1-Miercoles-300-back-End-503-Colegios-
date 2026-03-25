package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="Usuarios")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(name="nombre", nullable = false, length =50)
    private String nombre;
    
    @Column(name="correo", nullable = false, length =50, unique = true)
    private String correo;
    
    @Column(name="contra", nullable = false, length =50)
    private String contra;
    
    @Column(name="genero", nullable = false, length =50)
    private String genero;

    
    
    
}
