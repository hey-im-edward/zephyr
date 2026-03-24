package com.webbanpc.shoestore.auth;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.webbanpc.shoestore.user.UserAccount;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.algorithm = Algorithm.HMAC256(properties.secret());
        this.verifier = JWT.require(algorithm).build();
    }

    public TokenPayload generateAccessToken(UserAccount user) {
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(properties.accessTokenMinutes());
        String token = JWT.create()
                .withSubject(user.getEmail())
                .withClaim("role", user.getRole().name())
                .withClaim("userId", user.getId())
                .withExpiresAt(toInstant(expiresAt))
                .sign(algorithm);
        return new TokenPayload(token, expiresAt);
    }

    public DecodedJWT verify(String token) {
        return verifier.verify(token);
    }

    private Instant toInstant(LocalDateTime value) {
        return value.toInstant(ZoneOffset.UTC);
    }

    public record TokenPayload(String token, LocalDateTime expiresAt) {
    }
}
