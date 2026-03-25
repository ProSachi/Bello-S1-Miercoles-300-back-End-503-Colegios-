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
@Table(name = "appointment")
public class Citas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String idcita;

    @Column(name = "date", nullable = false, length = 15)
    private String fecha;

    @Column(name = "hour", nullable = false, length = 10)
    private String hora;

    @Column(name = "place", nullable = false, length = 250)
    private String lugar;

    @Column(name = "medic", nullable = false, length = 70)
    private String medico;

   /*  @ManyToOne
    @JoinColumn(name = "fk_pacientecitas")
    private Paciente paciente;
 */
    public String getIdcita() {
        return idcita;
    }

    public void setIdcita(String idcita) {
        this.idcita = idcita;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public String getMedico() {
        return medico;
    }

    public void setMedico(String medico) {
        this.medico = medico;
    }    
}
