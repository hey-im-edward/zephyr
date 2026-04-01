package com.webbanpc.shoestore.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailResponse(
        Long id,
        String orderCode,
        String customerName,
        String email,
        String phone,
        String addressLine,
        String city,
        String notes,
        OrderStatus status,
        PaymentMethod paymentMethod,
        BigDecimal totalAmount,
        String shippingMethodName,
        String promotionCode,
        BigDecimal shippingFee,
        BigDecimal discountAmount,
        String deliveryWindow,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items) {
}
