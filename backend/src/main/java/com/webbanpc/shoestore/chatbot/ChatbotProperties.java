package com.webbanpc.shoestore.chatbot;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.chatbot")
public record ChatbotProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("OPENAI_COMPATIBLE") String provider,
        @DefaultValue("https://api.openai.com/v1") String baseUrl,
        String apiKey,
        @DefaultValue("gpt-4o-mini") String model,
        @DefaultValue("0.2") double temperature,
        @DefaultValue("350") int maxTokens,
        @DefaultValue("15000") int timeoutMs,
        @DefaultValue("20") int requestsPerMinute,
        @DefaultValue("Ban la tro ly ZEPHYR, tra loi ngan gon, ro rang, uu tien thong tin checkout, don hang va san pham.") String systemPrompt) {

    public ChatbotProperties {
        provider = normalize(provider, "APP_CHATBOT_PROVIDER").toUpperCase();
        baseUrl = normalize(baseUrl, "APP_CHATBOT_BASE_URL");
        model = normalize(model, "APP_CHATBOT_MODEL");
        systemPrompt = normalize(systemPrompt, "APP_CHATBOT_SYSTEM_PROMPT");
        apiKey = normalizeOptional(apiKey);

        if (temperature < 0 || temperature > 2) {
            throw new IllegalStateException("APP_CHATBOT_TEMPERATURE must be between 0 and 2.");
        }
        if (maxTokens <= 0) {
            throw new IllegalStateException("APP_CHATBOT_MAX_TOKENS must be greater than 0.");
        }
        if (timeoutMs <= 0) {
            throw new IllegalStateException("APP_CHATBOT_TIMEOUT_MS must be greater than 0.");
        }
        if (requestsPerMinute <= 0) {
            throw new IllegalStateException("APP_CHATBOT_REQUESTS_PER_MINUTE must be greater than 0.");
        }

        if (!"OPENAI_COMPATIBLE".equals(provider)) {
            throw new IllegalStateException("APP_CHATBOT_PROVIDER currently supports only OPENAI_COMPATIBLE.");
        }

        if (enabled && (apiKey == null || apiKey.isBlank())) {
            throw new IllegalStateException("APP_CHATBOT_API_KEY must be provided when chatbot is enabled.");
        }
    }

    private static String normalize(String value, String propertyName) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new IllegalStateException(propertyName + " must not be blank.");
        }
        return normalized;
    }

    private static String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
