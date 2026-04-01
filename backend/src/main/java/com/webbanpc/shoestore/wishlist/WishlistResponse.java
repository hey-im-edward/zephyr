package com.webbanpc.shoestore.wishlist;

import java.math.BigDecimal;

public record WishlistResponse(
        Long id,
        Long shoeId,
        String shoeSlug,
        String shoeName,
        String brand,
        String silhouette,
        String primaryImage,
        BigDecimal price,
        String categoryName,
        boolean inStock) {
}
