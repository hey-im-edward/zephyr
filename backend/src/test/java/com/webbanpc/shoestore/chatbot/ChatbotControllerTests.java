package com.webbanpc.shoestore.chatbot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class ChatbotControllerTests {

    @Mock
    private ChatbotRateLimiter chatbotRateLimiter;

    @Mock
    private ChatbotService chatbotService;

    @Mock
    private HttpServletRequest servletRequest;

    private ChatbotController chatbotController;

    @BeforeEach
    void setUp() {
        chatbotController = new ChatbotController(chatbotRateLimiter, chatbotService);
    }

    @Test
    void shouldUseFirstForwardedAddressForRateLimitKey() {
        ChatbotCompletionRequest request = new ChatbotCompletionRequest("Xin chao", List.of());
        ChatbotCompletionResponse expected = new ChatbotCompletionResponse(
                "Da tiep nhan yeu cau.",
                "OPENAI_COMPATIBLE",
                "gpt-4o-mini",
                "req-01");

        when(servletRequest.getHeader("X-Forwarded-For")).thenReturn("10.1.0.2, 10.1.0.3");
        when(chatbotService.complete(eq(request))).thenReturn(expected);

        ChatbotCompletionResponse actual = chatbotController.complete(request, servletRequest);

        verify(chatbotRateLimiter).assertAllowed("10.1.0.2");
        verify(chatbotService).complete(request);
        assertEquals(expected, actual);
    }

    @Test
    void shouldFallbackToRemoteAddressWhenForwardedHeaderIsMissing() {
        ChatbotCompletionRequest request = new ChatbotCompletionRequest("Can ho tro checkout", List.of());
        ChatbotCompletionResponse expected = new ChatbotCompletionResponse(
                "Ban co the thanh toan tai buoc checkout.",
                "OPENAI_COMPATIBLE",
                "gpt-4o-mini",
                null);

        when(servletRequest.getHeader("X-Forwarded-For")).thenReturn("   ");
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(chatbotService.complete(eq(request))).thenReturn(expected);

        ChatbotCompletionResponse actual = chatbotController.complete(request, servletRequest);

        verify(chatbotRateLimiter).assertAllowed("127.0.0.1");
        verify(chatbotService).complete(request);
        assertEquals(expected, actual);
    }
}
