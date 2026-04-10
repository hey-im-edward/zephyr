package com.webbanpc.shoestore.chatbot;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

import com.webbanpc.shoestore.common.TooManyRequestsException;

@Component
public class ChatbotRateLimiter {

    private final ChatbotProperties chatbotProperties;
    private final ConcurrentHashMap<String, RateWindow> windows = new ConcurrentHashMap<>();

    public ChatbotRateLimiter(ChatbotProperties chatbotProperties) {
        this.chatbotProperties = chatbotProperties;
    }

    public void assertAllowed(String key) {
        long currentMinute = System.currentTimeMillis() / 60_000;
        RateWindow window = windows.computeIfAbsent(key, ignored -> new RateWindow(currentMinute));

        synchronized (window) {
            if (window.minute != currentMinute) {
                window.minute = currentMinute;
                window.counter.set(0);
            }

            int updated = window.counter.incrementAndGet();
            if (updated > chatbotProperties.requestsPerMinute()) {
                throw new TooManyRequestsException("Too many chatbot requests. Please retry in a minute.");
            }
        }
    }

    private static final class RateWindow {
        private volatile long minute;
        private final AtomicInteger counter = new AtomicInteger(0);

        private RateWindow(long minute) {
            this.minute = minute;
        }
    }
}
