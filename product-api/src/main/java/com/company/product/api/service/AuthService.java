package com.company.product.api.service;

import com.company.product.api.dto.AuthDtos;
import com.company.product.api.entity.ReaderEntity;
import com.company.product.api.entity.ReaderRoleType;
import com.company.product.api.entity.UserEntity;
import com.company.product.api.entity.UserRole;
import com.company.product.api.repository.ReaderRepository;
import com.company.product.api.repository.UserRepository;
import com.company.product.api.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ReaderRepository readerRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, ReaderRepository readerRepository,
                       JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.readerRepository = readerRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        String token = jwtService.generate(user);
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(UserRole.READER);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        UserEntity savedUser = userRepository.save(user);

        ReaderEntity reader = new ReaderEntity();
        reader.setFullName(savedUser.getFullName());
        reader.setRoleType(ReaderRoleType.STUDENT);
        reader.setContact(savedUser.getEmail());
        reader.setQrCode("RDR-U" + savedUser.getId());
        reader.setUser(savedUser);
        readerRepository.save(reader);

        String token = jwtService.generate(savedUser);
        return new AuthDtos.AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
    }
}
