package com.webbanpc.shoestore.promotion;

public record PromotionResponse(
        Long id,
        String code,
        String title,
        String description,
        String badge,
        String discountLabel,
        String heroTone,
        boolean active,
        boolean featured) {
}
