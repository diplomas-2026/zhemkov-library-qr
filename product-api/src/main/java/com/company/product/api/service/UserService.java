package com.company.product.api.service;

import com.company.product.api.dto.UserDtos;
import com.company.product.api.entity.UserEntity;
import com.company.product.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDtos.UserResponse> list() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserDtos.UserResponse create(UserDtos.CreateUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.UserResponse update(Long id, UserDtos.UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        userRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email уже зарегистрирован");
                });

        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setActive(request.active());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.UserResponse updateRole(Long id, UserDtos.UpdateRoleRequest request) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.UserResponse updateActive(Long id, UserDtos.UpdateActiveRequest request) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setActive(request.active());
        return toResponse(userRepository.save(user));
    }

    private UserDtos.UserResponse toResponse(UserEntity user) {
        return new UserDtos.UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isActive());
    }
}
