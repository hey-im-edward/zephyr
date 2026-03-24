package com.webbanpc.shoestore.shoe;

import java.math.BigDecimal;

public record ShoeCardResponse(
        Long id,
        String name,
        String slug,
        String brand,
        String silhouette,
        String shortDescription,
        BigDecimal price,
        String primaryImage,
        String secondaryImage,
        String categorySlug,
        String categoryName,
        boolean featured,
        boolean newArrival,
        boolean bestSeller) {
}
