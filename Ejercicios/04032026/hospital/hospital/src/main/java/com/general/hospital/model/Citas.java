package com.general.hospital.model;


public class Citas {

    private String idcita;
    private String fecha;
    private String hora;
    private String lugar;
    private String medico;


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
