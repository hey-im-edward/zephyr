package com.webbanpc.shoestore.banner;

public record BannerSlotResponse(
        Long id,
        String slotKey,
        String badge,
        String title,
        String description,
        String ctaLabel,
        String ctaHref,
        String imageUrl,
        String tone,
        boolean active,
        int sortOrder) {
}
