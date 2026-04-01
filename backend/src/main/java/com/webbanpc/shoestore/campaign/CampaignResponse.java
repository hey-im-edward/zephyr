package com.webbanpc.shoestore.campaign;

public record CampaignResponse(
        Long id,
        String title,
        String slug,
        String placement,
        String eyebrow,
        String headline,
        String description,
        String ctaLabel,
        String ctaHref,
        String backgroundImage,
        String focalImage,
        String heroTone,
        boolean active,
        int sortOrder) {
}
