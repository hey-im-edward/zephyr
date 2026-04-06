package com.webbanpc.shoestore.auth;

import java.time.Duration;
import java.time.LocalDateTime;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenCookieService {

    private final RefreshCookieProperties properties;

    public RefreshTokenCookieService(RefreshCookieProperties properties) {
        this.properties = properties;
    }

    public String resolveRefreshToken(HttpServletRequest request, String fallbackToken) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (properties.name().equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }

        if (fallbackToken == null || fallbackToken.isBlank()) {
            return null;
        }
        return fallbackToken.trim();
    }

    public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken, LocalDateTime expiresAt) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(refreshToken, expiresAt).toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(properties.name(), "")
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path(properties.path())
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private ResponseCookie buildCookie(String refreshToken, LocalDateTime expiresAt) {
        long maxAgeSeconds = Math.max(0, Duration.between(LocalDateTime.now(), expiresAt).getSeconds());

        return ResponseCookie.from(properties.name(), refreshToken)
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path(properties.path())
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }
}
