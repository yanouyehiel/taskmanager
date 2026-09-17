package com.yanouyehiel.taskmanager.api.service;

import com.yanouyehiel.taskmanager.api.dto.auth.AuthResponse;
import com.yanouyehiel.taskmanager.api.dto.auth.LoginRequest;
import com.yanouyehiel.taskmanager.api.dto.auth.RegisterRequest;
import com.yanouyehiel.taskmanager.api.entity.User;
import com.yanouyehiel.taskmanager.api.exception.EmailAlreadyExistsException;
import com.yanouyehiel.taskmanager.api.repository.UserRepository;
import com.yanouyehiel.taskmanager.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Tentative d'inscription pour l'email={}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Inscription refusée, email déjà utilisé={}", request.getEmail());
            throw new EmailAlreadyExistsException("Un compte existe déjà avec cet email");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        log.info("Utilisateur inscrit avec succès id={} email={}", saved.getId(), saved.getEmail());

        String token = jwtService.generateToken(toUserDetails(saved));

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Tentative de connexion pour l'email={}", request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Échec de connexion, identifiants invalides pour l'email={}", request.getEmail());
            throw ex;
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable après authentification"));

        String token = jwtService.generateToken(toUserDetails(user));
        log.info("Connexion réussie pour l'utilisateur id={} email={}", user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(java.util.Collections.emptyList())
                .build();
    }
}
