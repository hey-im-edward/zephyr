package com.webbanpc.shoestore.shoe;

import java.math.BigDecimal;
import java.util.List;

public record ShoeDetailResponse(
        Long id,
        String sku,
        String name,
        String slug,
        String brand,
        String silhouette,
        String shortDescription,
        String description,
        BigDecimal price,
        String primaryImage,
        String secondaryImage,
        List<String> availableSizes,
        List<SizeStockResponse> sizeStocks,
        List<String> accentColors,
        List<String> highlights,
        String categorySlug,
        String categoryName,
        boolean featured,
        boolean newArrival,
        boolean bestSeller,
        int totalStock,
        boolean inStock) {
}
