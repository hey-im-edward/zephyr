package com.webbanpc.shoestore.adminrole;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.audit.AuditLogService;
import com.webbanpc.shoestore.user.UserAccount;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/admin-roles")
public class AdminRoleController {

    private final AdminRoleService adminRoleService;
    private final AuditLogService auditLogService;

    public AdminRoleController(AdminRoleService adminRoleService, AuditLogService auditLogService) {
        this.adminRoleService = adminRoleService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AdminRoleResponse> list() {
        return adminRoleService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminRoleResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody AdminRoleRequest request) {
        AdminRoleResponse created = adminRoleService.create(request);
        auditLogService.record(actor, "ADMIN_ROLE_CREATE", "ADMIN_ROLE", String.valueOf(created.id()), "Created admin role " + created.code());
        return created;
    }

    @PutMapping("/{id}")
    public AdminRoleResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleRequest request) {
        AdminRoleResponse updated = adminRoleService.update(id, request);
        auditLogService.record(actor, "ADMIN_ROLE_UPDATE", "ADMIN_ROLE", String.valueOf(updated.id()), "Updated admin role " + updated.code());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        adminRoleService.delete(id);
        auditLogService.record(actor, "ADMIN_ROLE_DELETE", "ADMIN_ROLE", String.valueOf(id), "Deleted admin role #" + id);
    }
}
