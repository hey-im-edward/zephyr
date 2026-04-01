package com.webbanpc.shoestore.media;

import jakarta.validation.constraints.NotBlank;

public record MediaAssetRequest(
        @NotBlank String name,
        @NotBlank String mediaKind,
        @NotBlank String url,
        @NotBlank String altText,
        @NotBlank String dominantTone,
        @NotBlank String tags) {
}
