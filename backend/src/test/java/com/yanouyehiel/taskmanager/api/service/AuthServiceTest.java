package com.yanouyehiel.taskmanager.api.service;

import com.yanouyehiel.taskmanager.api.dto.auth.AuthResponse;
import com.yanouyehiel.taskmanager.api.dto.auth.LoginRequest;
import com.yanouyehiel.taskmanager.api.dto.auth.RegisterRequest;
import com.yanouyehiel.taskmanager.api.entity.User;
import com.yanouyehiel.taskmanager.api.exception.EmailAlreadyExistsException;
import com.yanouyehiel.taskmanager.api.repository.UserRepository;
import com.yanouyehiel.taskmanager.api.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtService);

        registerRequest = new RegisterRequest("Jean Dupont", "jean.dupont@example.com", "password123");
        loginRequest = new LoginRequest("jean.dupont@example.com", "password123");
    }

    @Test
    void register_shouldCreateUserAndReturnToken_whenEmailNotTaken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getFullName()).isEqualTo("Jean Dupont");
        assertThat(response.getEmail()).isEqualTo("jean.dupont@example.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded-password");
    }

    @Test
    void register_shouldThrowEmailAlreadyExistsException_whenEmailIsTaken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("existe déjà");

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(jwtService);
    }

    @Test
    void login_shouldAuthenticateAndReturnToken_whenCredentialsAreValid() {
        User user = User.builder()
                .id(1L)
                .fullName("Jean Dupont")
                .email("jean.dupont@example.com")
                .password("encoded-password")
                .build();

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("jean.dupont@example.com");

        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_shouldPropagateBadCredentialsException_whenAuthenticationFails() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Email ou mot de passe incorrect"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verifyNoInteractions(jwtService);
    }

    @Test
    void login_shouldThrowIllegalStateException_whenUserDisappearsAfterAuthentication() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(IllegalStateException.class);

        verifyNoInteractions(jwtService);
    }
}
