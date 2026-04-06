package com.webbanpc.shoestore.auth;

import java.time.LocalDateTime;

public record AuthResponse(
        String accessToken,
        LocalDateTime accessTokenExpiresAt,
        String refreshToken,
        LocalDateTime refreshTokenExpiresAt,
        AuthUserResponse user) {

    public AuthResponse withoutRefreshToken() {
        return new AuthResponse(accessToken, accessTokenExpiresAt, null, null, user);
    }
}
