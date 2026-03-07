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
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
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
