package com.webbanpc.shoestore.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.auth.google")
public record GoogleAuthProperties(
        @DefaultValue("false") boolean enabled,
        String clientId,
        @DefaultValue("https://oauth2.googleapis.com/tokeninfo") String tokenInfoUrl) {

    public GoogleAuthProperties {
        String normalizedTokenInfoUrl = tokenInfoUrl == null ? "" : tokenInfoUrl.trim();
        if (normalizedTokenInfoUrl.isEmpty()) {
            normalizedTokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo";
        }
        tokenInfoUrl = normalizedTokenInfoUrl;

        if (enabled && (clientId == null || clientId.isBlank())) {
            throw new IllegalStateException("APP_AUTH_GOOGLE_CLIENT_ID must be provided when APP_AUTH_GOOGLE_ENABLED=true.");
        }
    }
}