package com.webbanpc.shoestore.banner;

import jakarta.validation.constraints.NotBlank;

public record BannerSlotRequest(
        @NotBlank String slotKey,
        @NotBlank String badge,
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String ctaLabel,
        @NotBlank String ctaHref,
        @NotBlank String imageUrl,
        @NotBlank String tone,
        boolean active,
        int sortOrder) {
}
