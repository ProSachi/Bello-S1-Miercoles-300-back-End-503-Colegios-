package com.hospital.control.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
@Table(name = "Pacientes")
public class Paciente extends Persona {

  @ManyToOne
  @JoinColumn(name = "medico_id")
  private Medico medico;

  @ManyToMany(mappedBy = "pacientes")
  private List<Medicamento> medicamentos = new ArrayList<>();
}
