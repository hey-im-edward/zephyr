package com.webbanpc.shoestore.auth;

import java.time.LocalDateTime;

public record AuthResponse(
        String accessToken,
        LocalDateTime accessTokenExpiresAt,
        String refreshToken,
        LocalDateTime refreshTokenExpiresAt,
        AuthUserResponse user) {
}
