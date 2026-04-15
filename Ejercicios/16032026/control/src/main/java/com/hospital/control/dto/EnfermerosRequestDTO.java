package com.hospital.control.dto;

import lombok.Data;

//(Escritura / POST) 

@Data
public class EnfermerosRequestDTO {

    private String nombre;
    private String apellido;
    private String especialidad;

}
