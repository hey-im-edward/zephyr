package com.webbanpc.shoestore.chatbot;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.webbanpc.shoestore.common.TooManyRequestsException;

class ChatbotRateLimiterTests {

    @Test
    void shouldAllowRequestsWithinConfiguredLimit() {
        ChatbotRateLimiter limiter = new ChatbotRateLimiter(buildProperties(2));

        assertDoesNotThrow(() -> limiter.assertAllowed("client-1"));
        assertDoesNotThrow(() -> limiter.assertAllowed("client-1"));
    }

    @Test
    void shouldRejectRequestWhenLimitExceeded() {
        ChatbotRateLimiter limiter = new ChatbotRateLimiter(buildProperties(2));

        limiter.assertAllowed("client-2");
        limiter.assertAllowed("client-2");

        assertThrows(TooManyRequestsException.class, () -> limiter.assertAllowed("client-2"));
    }

    private ChatbotProperties buildProperties(int requestsPerMinute) {
        return new ChatbotProperties(
                false,
                "OPENAI_COMPATIBLE",
                "https://api.openai.com/v1",
                null,
                "gpt-4o-mini",
                0.2,
                300,
                10000,
                requestsPerMinute,
                "He thong tro ly cho storefront");
    }
}
