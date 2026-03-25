package com.java.clase2.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HolaController {
  
    @GetMapping("/saludo")
    public String saludar() {
        // 3. Spring convertirá este String en una respuesta HTTP
        return "HOla para los me leen";
    }
      
    @GetMapping("/despedida")
    public String despedida() {
        // 3. Spring convertirá este String en una respuesta HTTP
        return "adios para los me leen";
    }

}
