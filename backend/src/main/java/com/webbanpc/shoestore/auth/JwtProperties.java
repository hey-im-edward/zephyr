package com.webbanpc.shoestore.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long accessTokenMinutes,
        long refreshTokenDays) {

        private static final String INSECURE_DEFAULT = "change-this-super-long-dev-secret-key-for-zephyr";
        private static final int MIN_SECRET_LENGTH = 32;

        public JwtProperties {
                if (secret == null || secret.isBlank()) {
                        throw new IllegalStateException("APP_JWT_SECRET must be provided and must not be blank.");
                }

                String normalizedSecret = secret.trim();
                if (INSECURE_DEFAULT.equals(normalizedSecret)) {
                        throw new IllegalStateException("APP_JWT_SECRET uses an insecure placeholder value and must be rotated.");
                }
                if (normalizedSecret.length() < MIN_SECRET_LENGTH) {
                        throw new IllegalStateException("APP_JWT_SECRET must be at least 32 characters long.");
                }

                if (accessTokenMinutes <= 0) {
                        throw new IllegalStateException("APP_JWT_ACCESS_TOKEN_MINUTES must be greater than 0.");
                }
                if (refreshTokenDays <= 0) {
                        throw new IllegalStateException("APP_JWT_REFRESH_TOKEN_DAYS must be greater than 0.");
                }
        }
}
