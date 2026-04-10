package com.webbanpc.shoestore.chatbot;

public record ChatbotCompletionResponse(
        String answer,
        String provider,
        String model,
        String requestId) {
}
