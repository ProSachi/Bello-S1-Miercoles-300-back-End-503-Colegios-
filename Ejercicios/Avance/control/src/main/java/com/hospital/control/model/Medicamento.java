package com.hospital.control.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Medicamentos")
public class Medicamento {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String nombreMedicamento;
  private String descripcion;

  @ManyToMany
  @JoinTable(
    name = "paciente_medicamento",
    joinColumns = @JoinColumn(name = "medicamento_id"),
    inverseJoinColumns = @JoinColumn(name = "paciente_id")
  )
  private List<Paciente> pacientes = new ArrayList<>();
}
