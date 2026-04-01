package com.webbanpc.shoestore.media;

import java.time.LocalDateTime;

public record MediaAssetResponse(
        Long id,
        String name,
        String mediaKind,
        String url,
        String altText,
        String dominantTone,
        String tags,
        LocalDateTime createdAt) {
}
