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

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "Tareas")
@Entity
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "Fecha", nullable = false)
    private String date;

    @Column(name = "Descripcion", nullable = false, length = 255)
    private String description;

    @Column(name = "Titulo", nullable = false, length = 60)
    private String title;

    @Column (name = "EstaHecho", nullable = false)
    private boolean itsDone;


}
