package com.webbanpc.shoestore.recommendation;

import java.math.BigDecimal;

public record RecommendationResponse(
        Long id,
        String reasonLabel,
        Long shoeId,
        String shoeSlug,
        String shoeName,
        String brand,
        String silhouette,
        String primaryImage,
        BigDecimal price,
        String categoryName) {
}
