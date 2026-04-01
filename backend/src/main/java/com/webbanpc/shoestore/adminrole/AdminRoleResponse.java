package com.webbanpc.shoestore.adminrole;

public record AdminRoleResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean active) {
}
