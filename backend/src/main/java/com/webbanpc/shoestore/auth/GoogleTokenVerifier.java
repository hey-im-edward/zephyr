package com.webbanpc.shoestore.auth;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.webbanpc.shoestore.common.UnauthorizedException;

@Service
public class GoogleTokenVerifier {

    private final RestClient restClient;
    private final GoogleAuthProperties properties;

    public GoogleTokenVerifier(RestClient.Builder restClientBuilder, GoogleAuthProperties properties) {
        this.restClient = restClientBuilder.build();
        this.properties = properties;
    }

    public GoogleIdentity verify(String idToken) {
        if (!properties.enabled()) {
            throw new UnauthorizedException("Google login is not enabled");
        }

        GoogleTokenInfo tokenInfo;
        try {
            tokenInfo = restClient.get()
                    .uri(UriComponentsBuilder.fromUriString(properties.tokenInfoUrl())
                            .queryParam("id_token", idToken)
                            .build(true)
                            .toUri())
                    .retrieve()
                    .body(GoogleTokenInfo.class);
        } catch (Exception exception) {
            throw new UnauthorizedException("Google token is invalid");
        }

        if (tokenInfo == null) {
            throw new UnauthorizedException("Google token is invalid");
        }

        String subject = normalize(tokenInfo.sub());
        String email = normalize(tokenInfo.email()).toLowerCase();
        String fullName = normalize(tokenInfo.name());
        String audience = normalize(tokenInfo.aud());
        String emailVerified = normalize(tokenInfo.emailVerified());

        if (subject.isEmpty() || email.isEmpty() || audience.isEmpty()) {
            throw new UnauthorizedException("Google token is invalid");
        }

        if (!properties.clientId().equals(audience)) {
            throw new UnauthorizedException("Google token audience mismatch");
        }

        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new UnauthorizedException("Google account email is not verified");
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(normalize(tokenInfo.exp()));
        } catch (NumberFormatException exception) {
            throw new UnauthorizedException("Google token is invalid");
        }

        if (Instant.ofEpochSecond(expiresAt).isBefore(Instant.now())) {
            throw new UnauthorizedException("Google token has expired");
        }

        return new GoogleIdentity(subject, email, fullName);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GoogleTokenInfo(
            String sub,
            String email,
            String aud,
            String exp,
            String name,
            @JsonProperty("email_verified") String emailVerified) {
    }
}