package com.yanouyehiel.taskmanager.api.controller;

import com.yanouyehiel.taskmanager.api.dto.auth.AuthResponse;
import com.yanouyehiel.taskmanager.api.dto.auth.LoginRequest;
import com.yanouyehiel.taskmanager.api.dto.auth.RegisterRequest;
import com.yanouyehiel.taskmanager.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Inscription et connexion des utilisateurs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @SecurityRequirements
    @Operation(summary = "Inscrire un nouvel utilisateur", description = "Crée un compte utilisateur et retourne un token JWT.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Connecter un utilisateur", description = "Authentifie l'utilisateur et retourne un token JWT.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
