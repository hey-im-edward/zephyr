package com.webbanpc.shoestore.collection;

import java.math.BigDecimal;
import java.util.List;

public record CollectionResponse(
        Long id,
        String name,
        String slug,
        String description,
        String featureLabel,
        String heroTone,
        String coverImage,
        boolean active,
        int sortOrder,
        List<CollectionShoeResponse> items) {

    public record CollectionShoeResponse(
            Long id,
            String name,
            String slug,
            String brand,
            String silhouette,
            String shortDescription,
            BigDecimal price,
            String primaryImage,
            String categoryName) {
    }
}
