package com.webbanpc.shoestore.review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        String customerName,
        int rating,
        String title,
        String body,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
