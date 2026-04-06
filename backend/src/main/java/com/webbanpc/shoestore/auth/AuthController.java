package com.webbanpc.shoestore.auth;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.common.UnauthorizedException;
import com.webbanpc.shoestore.user.UserAccount;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    public AuthController(AuthService authService, RefreshTokenCookieService refreshTokenCookieService) {
        this.authService = authService;
        this.refreshTokenCookieService = refreshTokenCookieService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        return writeSessionCookie(response, authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return writeSessionCookie(response, authService.login(request));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String refreshToken = resolveRefreshToken(httpRequest, request == null ? null : request.refreshToken());
        return writeSessionCookie(response, authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @RequestBody(required = false) LogoutRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String refreshToken = resolveOptionalRefreshToken(httpRequest, request == null ? null : request.refreshToken());
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        refreshTokenCookieService.clearRefreshTokenCookie(response);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal UserAccount user) {
        return authService.currentUser(user);
    }

    @PatchMapping("/me")
    public AuthUserResponse updateProfile(
            @AuthenticationPrincipal UserAccount user,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(user, request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @AuthenticationPrincipal UserAccount user,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response) {
        authService.changePassword(user, request);
        refreshTokenCookieService.clearRefreshTokenCookie(response);
    }

    private AuthResponse writeSessionCookie(HttpServletResponse response, AuthResponse authResponse) {
        if (authResponse.refreshToken() != null) {
            refreshTokenCookieService.addRefreshTokenCookie(
                    response,
                    authResponse.refreshToken(),
                    authResponse.refreshTokenExpiresAt());
        }
        return authResponse.withoutRefreshToken();
    }

    private String resolveRefreshToken(HttpServletRequest request, String fallbackToken) {
        String refreshToken = resolveOptionalRefreshToken(request, fallbackToken);
        if (refreshToken == null) {
            throw new UnauthorizedException("Refresh token is invalid");
        }
        return refreshToken;
    }

    private String resolveOptionalRefreshToken(HttpServletRequest request, String fallbackToken) {
        return refreshTokenCookieService.resolveRefreshToken(request, fallbackToken);
    }
}
