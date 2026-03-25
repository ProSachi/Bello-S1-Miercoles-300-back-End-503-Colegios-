package com.libreria.ecommerce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/saludar")
    public String saludar() {
        return "Hola estoy saludando";
    }

}
