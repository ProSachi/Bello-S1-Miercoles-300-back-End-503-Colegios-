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
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String idpaciente;

    @Column(name = "name", nullable = false, length = 60)
    private String nombre;

    @Column(name = "age", nullable = false, length = 60)
    private String edad;

    @Column(name = "document", nullable = false, length = 60, unique = true)
    private String documento;

    @Column(name = "email", length = 60)
    private String correo;

    @Column(name = "rh", nullable = false, length = 60)
    private String rh;

/*     @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL)
    private List<Citas> citas; */

    public String getIdpaciente() {
        return idpaciente;
    }

    public void setIdpaciente(String idpaciente) {
        this.idpaciente = idpaciente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEdad() {
        return edad;
    }

    public void setEdad(String edad) {
        this.edad = edad;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getRh() {
        return rh;
    }

    public void setRh(String rh) {
        this.rh = rh;
    }

}
