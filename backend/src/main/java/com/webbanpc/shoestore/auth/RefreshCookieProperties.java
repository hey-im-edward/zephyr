package com.webbanpc.shoestore.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.auth.refresh-cookie")
public record RefreshCookieProperties(
        @DefaultValue("zephyr_refresh_token") String name,
        @DefaultValue("/api/v1/auth") String path,
        @DefaultValue("false") boolean secure,
        @DefaultValue("Lax") String sameSite,
        String domain) {

    public RefreshCookieProperties {
        name = normalize(name, "APP_AUTH_REFRESH_COOKIE_NAME", "zephyr_refresh_token");
        path = normalize(path, "APP_AUTH_REFRESH_COOKIE_PATH", "/api/v1/auth");
        sameSite = normalizeSameSite(sameSite);
        domain = normalizeOptional(domain);
    }

    private static String normalize(String value, String propertyName, String fallback) {
        String normalized = value == null ? fallback : value.trim();
        if (normalized.isBlank()) {
            throw new IllegalStateException(propertyName + " must not be blank.");
        }
        return normalized;
    }

    private static String normalizeSameSite(String value) {
        String normalized = normalize(value, "APP_AUTH_REFRESH_COOKIE_SAME_SITE", "Lax");
        return switch (normalized.toLowerCase()) {
            case "lax" -> "Lax";
            case "strict" -> "Strict";
            case "none" -> "None";
            default -> throw new IllegalStateException(
                    "APP_AUTH_REFRESH_COOKIE_SAME_SITE must be one of: Lax, Strict, None.");
        };
    }

    private static String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
