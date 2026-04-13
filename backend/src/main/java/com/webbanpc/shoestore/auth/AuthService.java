package com.webbanpc.shoestore.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ConflictException;
import com.webbanpc.shoestore.common.UnauthorizedException;
import com.webbanpc.shoestore.user.AuthProvider;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final int FULL_NAME_MAX_LENGTH = 120;
    private static final int SYNTHETIC_PHONE_LENGTH = 10;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            JwtProperties jwtProperties,
            GoogleTokenVerifier googleTokenVerifier) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        UserAccount newUser = UserAccount.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .phone(request.phone().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
            .authProvider(AuthProvider.LOCAL)
                .role(UserRole.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        UserAccount user = Objects.requireNonNull(userRepository.save(Objects.requireNonNull(newUser)));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("Invalid credentials");
        }

        UserAccount user = Objects.requireNonNull(userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials")));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdentity identity = googleTokenVerifier.verify(idToken);
        UserAccount user = resolveGoogleUser(identity);

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken token = Objects.requireNonNull(refreshTokenRepository.findByTokenHashForUpdate(hash(rawRefreshToken))
                .orElseThrow(() -> new UnauthorizedException("Refresh token is invalid")));

        if (token.isRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return issueTokens(token.getUser());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHashForUpdate(hash(rawRefreshToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    public CurrentUserResponse currentUser(UserAccount user) {
        return new CurrentUserResponse(AuthUserResponse.from(user));
    }

    @Transactional
    public AuthUserResponse updateProfile(UserAccount user, ProfileUpdateRequest request) {
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());
        return AuthUserResponse.from(user);
    }

    @Transactional
    public void changePassword(UserAccount user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    private UserAccount resolveGoogleUser(GoogleIdentity identity) {
        return userRepository.findByAuthProviderAndAuthProviderSubject(AuthProvider.GOOGLE, identity.subject())
                .orElseGet(() -> upsertGoogleUser(identity));
    }

    private UserAccount upsertGoogleUser(GoogleIdentity identity) {
        try {
            UserAccount existingUser = userRepository.findByEmail(identity.email()).orElse(null);
            if (existingUser != null) {
                linkGoogleIdentity(existingUser, identity);
                return Objects.requireNonNull(userRepository.save(existingUser));
            }

            return createUserFromGoogleIdentity(identity);
        } catch (DataIntegrityViolationException exception) {
            return Objects.requireNonNull(userRepository
                    .findByAuthProviderAndAuthProviderSubject(AuthProvider.GOOGLE, identity.subject())
                    .or(() -> userRepository.findByEmail(identity.email()))
                    .orElseThrow(() -> new ConflictException("Email already exists")));
        }
    }

    private void linkGoogleIdentity(UserAccount user, GoogleIdentity identity) {
        String subject = identity.subject() == null ? "" : identity.subject().trim();
        if (subject.isEmpty()) {
            throw new UnauthorizedException("Google token is invalid");
        }

        String existingSubject = user.getAuthProviderSubject() == null ? "" : user.getAuthProviderSubject().trim();
        if (!existingSubject.isEmpty() && !existingSubject.equals(subject)) {
            throw new UnauthorizedException("Google account does not match existing account");
        }

        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setAuthProviderSubject(subject);
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(buildSyntheticPhoneFromSubject(subject));
        }
    }

    private UserAccount createUserFromGoogleIdentity(GoogleIdentity identity) {
        UserAccount socialUser = UserAccount.builder()
                .fullName(resolveFullName(identity.fullName(), identity.email()))
                .email(identity.email())
                .phone(buildSyntheticPhoneFromSubject(identity.subject()))
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString() + UUID.randomUUID()))
                .authProvider(AuthProvider.GOOGLE)
                .authProviderSubject(identity.subject())
                .role(UserRole.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        return Objects.requireNonNull(userRepository.save(Objects.requireNonNull(socialUser)));
    }

    private String resolveFullName(String candidate, String fallbackEmail) {
        String normalized = candidate == null ? "" : candidate.trim();
        if (normalized.isBlank()) {
            normalized = fallbackEmail;
        }
        if (normalized.length() > FULL_NAME_MAX_LENGTH) {
            return normalized.substring(0, FULL_NAME_MAX_LENGTH);
        }
        return normalized;
    }

    private String buildSyntheticPhoneFromSubject(String subject) {
        String digest = hash(subject == null ? UUID.randomUUID().toString() : subject);
        StringBuilder digits = new StringBuilder(SYNTHETIC_PHONE_LENGTH);
        for (int index = 0; index < digest.length() && digits.length() < SYNTHETIC_PHONE_LENGTH; index++) {
            char current = digest.charAt(index);
            if (Character.isDigit(current)) {
                digits.append(current);
            }
        }
        while (digits.length() < SYNTHETIC_PHONE_LENGTH) {
            digits.append('0');
        }
        return digits.toString();
    }

    private AuthResponse issueTokens(UserAccount user) {
        JwtService.TokenPayload accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString() + UUID.randomUUID();
        LocalDateTime refreshExpiresAt = LocalDateTime.now().plusDays(jwtProperties.refreshTokenDays());

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawRefreshToken))
                .expiresAt(refreshExpiresAt)
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();
        RefreshToken refreshToken = Objects.requireNonNull(
                refreshTokenRepository.save(Objects.requireNonNull(newRefreshToken)));

        return new AuthResponse(
                accessToken.token(),
                accessToken.expiresAt(),
                rawRefreshToken,
                refreshExpiresAt,
                AuthUserResponse.from(refreshToken.getUser()));
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 not available", exception);
        }
    }
}
