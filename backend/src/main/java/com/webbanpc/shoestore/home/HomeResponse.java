package com.webbanpc.shoestore.home;

import java.util.List;

import com.webbanpc.shoestore.banner.BannerSlotResponse;
import com.webbanpc.shoestore.campaign.CampaignResponse;
import com.webbanpc.shoestore.category.CategoryResponse;
import com.webbanpc.shoestore.collection.CollectionResponse;
import com.webbanpc.shoestore.promotion.PromotionResponse;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;

public record HomeResponse(
        String headline,
        String subheadline,
        String spotlightLabel,
        List<CategoryResponse> categories,
        List<ShoeCardResponse> featured,
        List<ShoeCardResponse> newArrivals,
        CampaignResponse heroCampaign,
        List<BannerSlotResponse> promoBanners,
        List<CollectionResponse> featuredCollections,
        PromotionResponse activePromotion) {
}
