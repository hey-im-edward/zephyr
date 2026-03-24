package com.webbanpc.shoestore.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Email @NotBlank String email,
        @NotBlank @Pattern(regexp = "[0-9+ ]{9,20}", message = "Phone must be a valid number") String phone,
        @NotBlank @Size(min = 8, max = 72) String password) {
}
