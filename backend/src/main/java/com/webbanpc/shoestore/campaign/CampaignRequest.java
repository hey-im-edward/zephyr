package com.webbanpc.shoestore.campaign;

import jakarta.validation.constraints.NotBlank;

public record CampaignRequest(
        @NotBlank String title,
        @NotBlank String placement,
        @NotBlank String eyebrow,
        @NotBlank String headline,
        @NotBlank String description,
        @NotBlank String ctaLabel,
        @NotBlank String ctaHref,
        @NotBlank String backgroundImage,
        @NotBlank String focalImage,
        @NotBlank String heroTone,
        boolean active,
        int sortOrder) {
}
