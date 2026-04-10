package com.webbanpc.shoestore.chatbot;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webbanpc.shoestore.common.BadRequestException;

@Service
public class ChatbotService {

    private final ChatbotProperties chatbotProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ChatbotService(ChatbotProperties chatbotProperties, ObjectMapper objectMapper) {
        this.chatbotProperties = chatbotProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(chatbotProperties.timeoutMs()))
                .build();
    }

    public ChatbotCompletionResponse complete(ChatbotCompletionRequest request) {
        if (!chatbotProperties.enabled()) {
            throw new BadRequestException("Chatbot is not enabled on this environment.");
        }

        String userMessage = request.message() == null ? "" : request.message().trim();
        if (userMessage.isBlank()) {
            throw new BadRequestException("message must not be blank.");
        }

        try {
            String payload = objectMapper.writeValueAsString(buildPayload(userMessage, request.history()));
            HttpRequest httpRequest = HttpRequest.newBuilder(resolveCompletionEndpoint())
                    .timeout(Duration.ofMillis(chatbotProperties.timeoutMs()))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + chatbotProperties.apiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new BadRequestException("Chatbot provider request failed with status " + response.statusCode() + ".");
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText(null);
            if (content == null || content.isBlank()) {
                throw new BadRequestException("Chatbot provider returned an empty response.");
            }

            String requestId = response.headers().firstValue("x-request-id").orElse(null);
            return new ChatbotCompletionResponse(
                    content.trim(),
                    chatbotProperties.provider(),
                    chatbotProperties.model(),
                    requestId);
        } catch (IOException exception) {
            throw new BadRequestException("Cannot parse chatbot provider response.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Chatbot request was interrupted.");
        }
    }

    private URI resolveCompletionEndpoint() {
        String normalizedBase = chatbotProperties.baseUrl().endsWith("/")
                ? chatbotProperties.baseUrl().substring(0, chatbotProperties.baseUrl().length() - 1)
                : chatbotProperties.baseUrl();
        return URI.create(normalizedBase + "/chat/completions");
    }

    private Map<String, Object> buildPayload(String message, List<ChatbotMessage> history) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", chatbotProperties.model());
        payload.put("temperature", chatbotProperties.temperature());
        payload.put("max_tokens", chatbotProperties.maxTokens());

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "system",
                "content", chatbotProperties.systemPrompt()));

        for (ChatbotMessage item : history) {
            String role = item.role() == null ? "" : item.role().trim().toLowerCase();
            String content = item.content() == null ? "" : item.content().trim();
            if (("user".equals(role) || "assistant".equals(role)) && !content.isBlank()) {
                messages.add(Map.of(
                        "role", role,
                        "content", content));
            }
        }

        messages.add(Map.of(
                "role", "user",
                "content", message));

        payload.put("messages", messages);
        return payload;
    }
}
