package com.webbanpc.shoestore.auth;

import java.time.Duration;
import java.time.LocalDateTime;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseCookie.ResponseCookieBuilder;
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
        ResponseCookie cookie = applyCommonCookieAttributes(ResponseCookie.from(properties.name(), ""))
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private ResponseCookie buildCookie(String refreshToken, LocalDateTime expiresAt) {
        long maxAgeSeconds = Math.max(0, Duration.between(LocalDateTime.now(), expiresAt).getSeconds());

        return applyCommonCookieAttributes(ResponseCookie.from(properties.name(), refreshToken))
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();
    }

    private ResponseCookieBuilder applyCommonCookieAttributes(ResponseCookieBuilder builder) {
        ResponseCookieBuilder configuredBuilder = builder
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path(properties.path());

        if (properties.domain() != null) {
            configuredBuilder = configuredBuilder.domain(properties.domain());
        }

        return configuredBuilder;
    }
}
