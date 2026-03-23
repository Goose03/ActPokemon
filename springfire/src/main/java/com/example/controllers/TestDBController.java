package com.example.controllers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.service.FirebaseDBService;

@RestController
public class TestDBController {
    private final FirebaseDBService firebaseDBService;
        public TestDBController(FirebaseDBService firebaseDBService) {
            this.firebaseDBService = firebaseDBService;
        }
        @GetMapping("/firebase-test")
        public String testFirebase() {
        firebaseDBService.guardarDato();
        return "Dato enviado a Firebase";
    }
}