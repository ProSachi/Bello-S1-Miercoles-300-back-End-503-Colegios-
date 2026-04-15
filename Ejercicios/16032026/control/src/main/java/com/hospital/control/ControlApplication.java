package com.hospital.control;

import javax.swing.plaf.metal.MetalDesktopIconUI;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.hospital.control.model.Enfemeros;
import com.hospital.control.model.Medico;
import com.hospital.control.model.Persona;
import com.hospital.control.model.Varios;
import com.hospital.control.repository.EnfermerosRepository;
import com.hospital.control.repository.MedicoRepository;
import com.hospital.control.repository.VariosRepository;

@SpringBootApplication
public class ControlApplication {

	public static void main(String[] args) {
		SpringApplication.run(ControlApplication.class, args);
	}

	@Bean
	public CommandLineRunner run(
			MedicoRepository medicoRepository,
			EnfermerosRepository enfermerosRepository,
			VariosRepository variosRepository) {
		return args -> {

			System.out.println("--- Agregando Datos Manualmente ---");

			// 1. Crear y guardar Medicos
			Medico m1 = medicoRepository.save(new Medico("Dr Strange", "Freaky", "Tiempo"));
			Medico m2 = medicoRepository.save(new Medico("Dr Doom", "Victor", "Fisica"));

			// 2. Crear Enfermeros
			Enfemeros e1 = enfermerosRepository.save(new Enfemeros("Grace", "Anatomy", "Documentar Histoia"));

			// 3. Crear Varios
			Varios v1 = variosRepository.save(new Varios("Grace", "Anatomy", "Piso 5"));

			// 5. PERSISTIR
			// Al guardar el propietario, el CascadeType.ALL se encarga de:
			// Guardar m1 y f1 automáticamente.

			System.out.println("--- DATOS GUARDADOS EN ARCHIVO ---");

		};

	}
}



