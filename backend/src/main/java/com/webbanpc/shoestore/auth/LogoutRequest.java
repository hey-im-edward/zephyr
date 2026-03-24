package com.webbanpc.shoestore.auth;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(@NotBlank String refreshToken) {
}
