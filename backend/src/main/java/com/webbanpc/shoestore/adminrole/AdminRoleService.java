package com.webbanpc.shoestore.adminrole;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class AdminRoleService {

    private final AdminRoleRepository adminRoleRepository;

    public AdminRoleService(AdminRoleRepository adminRoleRepository) {
        this.adminRoleRepository = adminRoleRepository;
    }

    public List<AdminRoleResponse> list() {
        return adminRoleRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminRoleResponse create(AdminRoleRequest request) {
        AdminRole adminRole = AdminRole.builder()
                .code(request.code().trim().toUpperCase())
                .name(request.name())
                .description(request.description())
                .active(request.active())
                .build();
        return toResponse(adminRoleRepository.save(adminRole));
    }

    @Transactional
    public AdminRoleResponse update(@NonNull Long id, AdminRoleRequest request) {
        AdminRole adminRole = adminRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin role not found: " + id));
        adminRole.setCode(request.code().trim().toUpperCase());
        adminRole.setName(request.name());
        adminRole.setDescription(request.description());
        adminRole.setActive(request.active());
        return toResponse(adminRole);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        AdminRole adminRole = adminRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin role not found: " + id));
        adminRoleRepository.delete(adminRole);
    }

    private AdminRoleResponse toResponse(AdminRole adminRole) {
        return new AdminRoleResponse(
                adminRole.getId(),
                adminRole.getCode(),
                adminRole.getName(),
                adminRole.getDescription(),
                adminRole.isActive());
    }
}
