package com.webbanpc.shoestore.chatbot;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatbotCompletionRequest(
        @NotBlank String message,
        @Size(max = 12) List<@Valid ChatbotMessage> history) {

    public ChatbotCompletionRequest {
        history = history == null ? List.of() : history;
    }
}
