package com.webbanpc.shoestore.chatbot;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private final ChatbotRateLimiter chatbotRateLimiter;
    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotRateLimiter chatbotRateLimiter, ChatbotService chatbotService) {
        this.chatbotRateLimiter = chatbotRateLimiter;
        this.chatbotService = chatbotService;
    }

    @PostMapping("/completions")
    public ChatbotCompletionResponse complete(
            @Valid @RequestBody ChatbotCompletionRequest request,
            HttpServletRequest servletRequest) {
        chatbotRateLimiter.assertAllowed(resolveClientKey(servletRequest));
        return chatbotService.complete(request);
    }

    private String resolveClientKey(HttpServletRequest servletRequest) {
        String forwardedFor = servletRequest.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String firstIp = forwardedFor.split(",")[0].trim();
            if (!firstIp.isBlank()) {
                return firstIp;
            }
        }
        return servletRequest.getRemoteAddr();
    }
}
