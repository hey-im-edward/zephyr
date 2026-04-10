package com.webbanpc.shoestore.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.webbanpc.shoestore.order.PaymentMethod;

public record PaymentSessionResponse(
        String orderCode,
        PaymentMethod method,
        PaymentProvider provider,
        PaymentChannel channel,
        PaymentStatus status,
        BigDecimal amount,
        String referenceToken,
        String checkoutUrl,
        String qrImageUrl,
        String qrPayload,
        String walletDeepLink,
        String instruction,
        LocalDateTime expiresAt,
        LocalDateTime paidAt,
        boolean canConfirmMock) {
}
