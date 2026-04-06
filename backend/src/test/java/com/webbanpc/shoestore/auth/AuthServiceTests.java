package com.webbanpc.shoestore.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                new JwtProperties("0123456789abcdef0123456789abcdef", 15, 30));
    }

    @Test
    void shouldRevokeAllRefreshTokensWhenPasswordChanges() {
        UserAccount user = userAccount(42L, "shopper@zephyr.vn", "old-hash");
        when(passwordEncoder.matches("current-pass", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-pass")).thenReturn("new-hash");

        authService.changePassword(user, new ChangePasswordRequest("current-pass", "new-pass"));

        assertEquals("new-hash", user.getPasswordHash());
        verify(refreshTokenRepository).revokeAllByUserId(42L);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void shouldRotateRefreshTokenDuringRefresh() {
        UserAccount user = userAccount(42L, "shopper@zephyr.vn", "password-hash");
        String rawRefreshToken = "refresh-token-value";
        String hashedRefreshToken = sha256Hex(rawRefreshToken);
        RefreshToken existingRefreshToken = refreshToken(user, hashedRefreshToken, LocalDateTime.of(2030, 1, 2, 0, 0));
        when(refreshTokenRepository.findByTokenHashForUpdate(hashedRefreshToken)).thenReturn(Optional.of(existingRefreshToken));
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(user)).thenReturn(
                new JwtService.TokenPayload("access-token", LocalDateTime.of(2030, 1, 1, 0, 15)));

        AuthResponse response = authService.refresh(new RefreshRequest(rawRefreshToken));

        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(2)).save(tokenCaptor.capture());

        RefreshToken revokedToken = tokenCaptor.getAllValues().get(0);
        RefreshToken rotatedToken = tokenCaptor.getAllValues().get(1);

        assertEquals(existingRefreshToken, revokedToken);
        assertTrue(revokedToken.isRevoked());
        assertEquals(user.getId(), rotatedToken.getUser().getId());
        assertFalse(rotatedToken.isRevoked());
        assertNotEquals(revokedToken.getTokenHash(), rotatedToken.getTokenHash());
        assertEquals("access-token", response.accessToken());
        assertNotNull(response.refreshToken());
        assertEquals("shopper@zephyr.vn", response.user().email());
    }

    private UserAccount userAccount(Long id, String email, String passwordHash) {
        return UserAccount.builder()
                .id(id)
                .fullName("Shopper")
                .email(email)
                .phone("0900000000")
                .passwordHash(passwordHash)
                .role(UserRole.USER)
                .active(true)
                .build();
    }

    private RefreshToken refreshToken(UserAccount user, String tokenHash, LocalDateTime expiresAt) {
        return RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .revoked(false)
                .createdAt(LocalDateTime.of(2029, 12, 31, 0, 0))
                .build();
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 not available", exception);
        }
    }
}
