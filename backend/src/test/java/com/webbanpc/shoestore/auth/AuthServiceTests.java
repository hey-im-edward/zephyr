package com.webbanpc.shoestore.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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

import com.webbanpc.shoestore.common.UnauthorizedException;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.AuthProvider;
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

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                new JwtProperties("0123456789abcdef0123456789abcdef", 15, 30),
                googleTokenVerifier);
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

        AuthResponse response = authService.refresh(rawRefreshToken);

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

    @Test
    void shouldLoginExistingUserWithGoogle() {
        UserAccount user = userAccount(7L, "existing@zephyr.vn", "password-hash");
        when(googleTokenVerifier.verify("google-token"))
                .thenReturn(new GoogleIdentity("google-sub-1", "existing@zephyr.vn", "Existing User"));
        when(userRepository.findByAuthProviderAndAuthProviderSubject(AuthProvider.GOOGLE, "google-sub-1"))
            .thenReturn(Optional.empty());
        when(userRepository.findByEmail("existing@zephyr.vn")).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(user)).thenReturn(
                new JwtService.TokenPayload("google-access-token", LocalDateTime.of(2030, 1, 1, 0, 15)));

        AuthResponse response = authService.loginWithGoogle("google-token");

        assertEquals("google-access-token", response.accessToken());
        assertEquals("existing@zephyr.vn", response.user().email());
        assertEquals(AuthProvider.GOOGLE, user.getAuthProvider());
        assertEquals("google-sub-1", user.getAuthProviderSubject());
        verify(userRepository).save(user);
    }

    @Test
    void shouldCreateNewUserWhenGoogleEmailNotFound() {
        when(googleTokenVerifier.verify("new-google-token"))
                .thenReturn(new GoogleIdentity("google-sub-2", "new-user@zephyr.vn", "New Google User"));
        when(userRepository.findByAuthProviderAndAuthProviderSubject(AuthProvider.GOOGLE, "google-sub-2"))
            .thenReturn(Optional.empty());
        when(userRepository.findByEmail("new-user@zephyr.vn")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("generated-hash");
        when(userRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateAccessToken(any(UserAccount.class))).thenReturn(
                new JwtService.TokenPayload("google-access-token", LocalDateTime.of(2030, 1, 1, 0, 15)));

        AuthResponse response = authService.loginWithGoogle("new-google-token");

        ArgumentCaptor<UserAccount> userCaptor = ArgumentCaptor.forClass(UserAccount.class);
        verify(userRepository).save(userCaptor.capture());

        UserAccount createdUser = userCaptor.getValue();
        assertEquals("new-user@zephyr.vn", createdUser.getEmail());
        assertEquals("New Google User", createdUser.getFullName());
        assertEquals(AuthProvider.GOOGLE, createdUser.getAuthProvider());
        assertEquals("google-sub-2", createdUser.getAuthProviderSubject());
        assertEquals(10, createdUser.getPhone().length());
        assertEquals(UserRole.USER, createdUser.getRole());

        assertEquals(createdUser.getEmail(), response.user().email());
        assertEquals("google-access-token", response.accessToken());
    }

    @Test
    void shouldRejectGoogleLoginWhenSubjectDoesNotMatchExistingLinkedAccount() {
        UserAccount user = userAccount(12L, "existing@zephyr.vn", "password-hash");
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setAuthProviderSubject("google-sub-old");
        when(googleTokenVerifier.verify("google-token"))
                .thenReturn(new GoogleIdentity("google-sub-new", "existing@zephyr.vn", "Existing User"));
        when(userRepository.findByAuthProviderAndAuthProviderSubject(AuthProvider.GOOGLE, "google-sub-new"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("existing@zephyr.vn")).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> authService.loginWithGoogle("google-token"));

        verify(userRepository, never()).save(any(UserAccount.class));
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
