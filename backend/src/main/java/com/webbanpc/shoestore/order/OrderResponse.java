package com.webbanpc.shoestore.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String orderCode,
        String customerName,
        String email,
        OrderStatus status,
        PaymentMethod paymentMethod,
        String shippingMethodName,
        String promotionCode,
        BigDecimal totalAmount,
        BigDecimal shippingFee,
        BigDecimal discountAmount,
        String deliveryWindow,
        LocalDateTime createdAt) {
}
