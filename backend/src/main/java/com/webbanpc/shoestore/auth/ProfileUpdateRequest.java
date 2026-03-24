package com.webbanpc.shoestore.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Pattern(regexp = "[0-9+ ]{9,20}", message = "Phone must be a valid number") String phone) {
}
