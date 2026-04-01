package com.webbanpc.shoestore.adminrole;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/admin-roles")
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    public AdminRoleController(AdminRoleService adminRoleService) {
        this.adminRoleService = adminRoleService;
    }

    @GetMapping
    public List<AdminRoleResponse> list() {
        return adminRoleService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminRoleResponse create(@Valid @RequestBody AdminRoleRequest request) {
        return adminRoleService.create(request);
    }

    @PutMapping("/{id}")
    public AdminRoleResponse update(@PathVariable Long id, @Valid @RequestBody AdminRoleRequest request) {
        return adminRoleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminRoleService.delete(id);
    }
}
