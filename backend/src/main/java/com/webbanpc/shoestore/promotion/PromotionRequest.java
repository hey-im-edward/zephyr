package com.webbanpc.shoestore.promotion;

import jakarta.validation.constraints.NotBlank;

public record PromotionRequest(
        @NotBlank String code,
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String badge,
        @NotBlank String discountLabel,
        @NotBlank String heroTone,
        boolean active,
        boolean featured) {
}
