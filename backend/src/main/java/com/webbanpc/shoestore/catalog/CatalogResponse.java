package com.webbanpc.shoestore.catalog;

import java.math.BigDecimal;
import java.util.List;

import com.webbanpc.shoestore.campaign.CampaignResponse;
import com.webbanpc.shoestore.collection.CollectionResponse;
import com.webbanpc.shoestore.promotion.PromotionResponse;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;

public record CatalogResponse(
        List<ShoeCardResponse> items,
        CatalogPagination pagination,
        CatalogFacets facets,
        CampaignResponse heroCampaign,
        PromotionResponse activePromotion,
        List<CollectionResponse> featuredCollections) {

    public record CatalogPagination(
            int page,
            int pageSize,
            long totalItems,
            int totalPages) {
    }

    public record CatalogFacets(
            List<String> categories,
            List<String> brands,
            List<String> silhouettes,
            List<String> sizes,
            PriceRange priceRange) {
    }

    public record PriceRange(
            BigDecimal min,
            BigDecimal max) {
    }
}
