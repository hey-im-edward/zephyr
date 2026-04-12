package com.webbanpc.shoestore.payment;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

import com.webbanpc.shoestore.common.TooManyRequestsException;

@Component
public class PaymentRateLimiter {

    private static final long WINDOW_MILLIS = 60_000L;
    private static final int CLEANUP_EVERY_N_CALLS = 128;
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final PaymentOnlineProperties paymentOnlineProperties;
    private final ConcurrentHashMap<String, RateWindow> windows = new ConcurrentHashMap<>();
    private final AtomicInteger cleanupTicker = new AtomicInteger(0);

    public PaymentRateLimiter(PaymentOnlineProperties paymentOnlineProperties) {
        this.paymentOnlineProperties = paymentOnlineProperties;
    }

    public void assertAllowed(String key) {
        String normalizedKey = normalizeKey(key);
        long currentMinute = System.currentTimeMillis() / WINDOW_MILLIS;

        RateWindow window = windows.computeIfAbsent(normalizedKey, ignored -> new RateWindow(currentMinute));

        synchronized (window) {
            if (window.minute != currentMinute) {
                window.minute = currentMinute;
                window.counter.set(0);
            }

            int updated = window.counter.incrementAndGet();
            if (updated > paymentOnlineProperties.requestsPerMinute()) {
                throw new TooManyRequestsException("Too many payment requests. Please retry in a minute.");
            }
        }

        maybeCleanup(currentMinute);
    }

    private void maybeCleanup(long currentMinute) {
        if (windows.size() <= MAX_TRACKED_KEYS) {
            return;
        }

        if (cleanupTicker.incrementAndGet() % CLEANUP_EVERY_N_CALLS != 0) {
            return;
        }

        windows.entrySet().removeIf(entry -> entry.getValue().minute < currentMinute - 1);
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank()) {
            return "unknown";
        }

        String normalized = key.trim();
        if (normalized.length() <= 200) {
            return normalized;
        }

        return normalized.substring(0, 200);
    }

    private static final class RateWindow {
        private volatile long minute;
        private final AtomicInteger counter = new AtomicInteger(0);

        private RateWindow(long minute) {
            this.minute = minute;
        }
    }
}
