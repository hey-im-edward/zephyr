package com.webbanpc.shoestore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(String username, String password) {

	private static final String INSECURE_DEFAULT_PASSWORD = "change-me-now";

	public AdminProperties {
		if (username == null || username.isBlank()) {
			throw new IllegalStateException("APP_ADMIN_USERNAME must be provided and must not be blank.");
		}
		if (password == null || password.isBlank()) {
			throw new IllegalStateException("APP_ADMIN_PASSWORD must be provided and must not be blank.");
		}

		String normalizedPassword = password.trim();
		if (INSECURE_DEFAULT_PASSWORD.equals(normalizedPassword)) {
			throw new IllegalStateException("APP_ADMIN_PASSWORD uses an insecure placeholder value and must be rotated.");
		}
		if (normalizedPassword.length() < 12) {
			throw new IllegalStateException("APP_ADMIN_PASSWORD must be at least 12 characters long.");
		}
	}
}
