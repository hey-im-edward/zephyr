package com.webbanpc.shoestore.payment;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.webbanpc.shoestore.common.TooManyRequestsException;

class PaymentRateLimiterTests {

    @Test
    void shouldAllowRequestsWithinConfiguredLimit() {
        PaymentRateLimiter limiter = new PaymentRateLimiter(buildProperties(2));

        assertDoesNotThrow(() -> limiter.assertAllowed("create-session:ORDER-1:127.0.0.1"));
        assertDoesNotThrow(() -> limiter.assertAllowed("create-session:ORDER-1:127.0.0.1"));
    }

    @Test
    void shouldRejectRequestWhenLimitExceeded() {
        PaymentRateLimiter limiter = new PaymentRateLimiter(buildProperties(2));

        limiter.assertAllowed("mock-confirm:ORDER-2:REF-1:127.0.0.1");
        limiter.assertAllowed("mock-confirm:ORDER-2:REF-1:127.0.0.1");

        assertThrows(
                TooManyRequestsException.class,
                () -> limiter.assertAllowed("mock-confirm:ORDER-2:REF-1:127.0.0.1"));
    }

    private PaymentOnlineProperties buildProperties(int requestsPerMinute) {
        return new PaymentOnlineProperties(
                true,
                15,
                requestsPerMinute,
                "http://localhost:3000/checkout",
                "momo://app?action=pay&orderCode={orderCode}&amount={amount}",
                "VCB",
                "0123456789",
                "Zephyr Test Shop");
    }
}
