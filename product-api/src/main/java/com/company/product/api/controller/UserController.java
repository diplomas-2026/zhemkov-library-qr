package com.company.product.api.controller;

import com.company.product.api.dto.UserDtos;
import com.company.product.api.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDtos.UserResponse> list() {
        return userService.list();
    }

    @PostMapping
    public UserDtos.UserResponse create(@Valid @RequestBody UserDtos.CreateUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}/role")
    public UserDtos.UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UserDtos.UpdateRoleRequest request) {
        return userService.updateRole(id, request);
    }

    @PutMapping("/{id}/active")
    public UserDtos.UserResponse updateActive(@PathVariable Long id, @RequestBody UserDtos.UpdateActiveRequest request) {
        return userService.updateActive(id, request);
    }
}
