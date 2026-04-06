package com.webbanpc.shoestore.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.webbanpc.shoestore.auth.JwtProperties;

class SensitivePropertiesValidationTests {

    @Test
    void shouldRejectInsecureDefaultJwtSecret() {
        assertThrows(IllegalStateException.class,
                () -> new JwtProperties("change-this-super-long-dev-secret-key-for-zephyr", 30, 14));
    }

    @Test
    void shouldRejectShortJwtSecret() {
        assertThrows(IllegalStateException.class,
                () -> new JwtProperties("short-secret", 30, 14));
    }

    @Test
    void shouldRejectInsecureDefaultAdminPassword() {
        assertThrows(IllegalStateException.class,
                () -> new AdminProperties("admin@zephyr.vn", "change-me-now"));
    }

    @Test
    void shouldAcceptStrongAdminAndJwtConfig() {
        assertDoesNotThrow(() -> new AdminProperties("admin@zephyr.vn", "StrongAdminPass123!"));
        assertDoesNotThrow(() -> new JwtProperties(
                "strong-jwt-secret-0123456789-abcdefghijklmnopqrstuvwxyz",
                30,
                14));
    }
}
