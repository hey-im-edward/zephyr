package com.webbanpc.shoestore.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RefreshTokenCookieServiceTests {

    private final RefreshTokenCookieService cookieService =
            new RefreshTokenCookieService(
                    new RefreshCookieProperties("zephyr_refresh_token", "/api/v1/auth", false, "Lax", null));

    @Test
    void shouldResolveRefreshTokenFromCookieBeforeFallbackToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("zephyr_refresh_token", "cookie-token"));

        String resolved = cookieService.resolveRefreshToken(request, "body-token");

        assertEquals("cookie-token", resolved);
    }

    @Test
    void shouldFallBackToBodyTokenWhenCookieIsMissing() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        String resolved = cookieService.resolveRefreshToken(request, "body-token");

        assertEquals("body-token", resolved);
    }

    @Test
    void shouldReturnNullWhenNeitherCookieNorFallbackTokenExists() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        String resolved = cookieService.resolveRefreshToken(request, null);

        assertNull(resolved);
    }

    @Test
    void shouldWriteHttpOnlyRefreshCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieService.addRefreshTokenCookie(response, "refresh-token", LocalDateTime.now().plusDays(7));

        String header = response.getHeader("Set-Cookie");
        assertTrue(header.contains("zephyr_refresh_token=refresh-token"));
        assertTrue(header.contains("HttpOnly"));
        assertTrue(header.contains("SameSite=Lax"));
        assertTrue(header.contains("Path=/api/v1/auth"));
    }

    @Test
    void shouldClearRefreshCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        cookieService.clearRefreshTokenCookie(response);

        String header = response.getHeader("Set-Cookie");
        assertTrue(header.contains("zephyr_refresh_token="));
        assertTrue(header.contains("Max-Age=0"));
    }
}
