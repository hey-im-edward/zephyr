package com.webbanpc.shoestore.adminrole;

import jakarta.validation.constraints.NotBlank;

public record AdminRoleRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank String description,
        boolean active) {
}
