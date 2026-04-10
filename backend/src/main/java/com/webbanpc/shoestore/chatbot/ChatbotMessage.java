package com.webbanpc.shoestore.chatbot;

import jakarta.validation.constraints.NotBlank;

public record ChatbotMessage(
        @NotBlank String role,
        @NotBlank String content) {
}
