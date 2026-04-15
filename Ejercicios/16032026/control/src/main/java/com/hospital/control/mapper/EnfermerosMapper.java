package com.hospital.control.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.hospital.control.dto.EnfermerosRequestDTO;
import com.hospital.control.dto.EnfermerosResponseDTO;
import com.hospital.control.model.Enfemeros;

// --- DE ENTIDAD A DTO (Para responderle al cliente) ---
@Mapper(componentModel = "spring")
public interface EnfermerosMapper {

    @Mapping(target = "especialidad", source = "especialidad")
    List<EnfermerosResponseDTO> toResponseDTOList(List<Enfemeros> enfermeros);

    @Mapping(target = "id", ignore = true) // Hibernate generará el ID
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "apellido", source = "apellido")
    @Mapping(target = "especialidad", source = "especialidad")

    Enfemeros toEntity(EnfermerosRequestDTO requestDTO);

}
