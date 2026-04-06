package com.webbanpc.shoestore.catalog;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.campaign.CampaignService;
import com.webbanpc.shoestore.collection.CollectionResponse;
import com.webbanpc.shoestore.collection.CollectionService;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.review.ReviewRepository;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;
import com.webbanpc.shoestore.shoe.ShoeRepository;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private static final int MAX_PAGE_SIZE = 60;

    private final ShoeRepository shoeRepository;
    private final ReviewRepository reviewRepository;
    private final CampaignService campaignService;
    private final PromotionService promotionService;
    private final CollectionService collectionService;

    public CatalogService(
            ShoeRepository shoeRepository,
            ReviewRepository reviewRepository,
            CampaignService campaignService,
            PromotionService promotionService,
            CollectionService collectionService) {
        this.shoeRepository = shoeRepository;
        this.reviewRepository = reviewRepository;
        this.campaignService = campaignService;
        this.promotionService = promotionService;
        this.collectionService = collectionService;
    }

    public CatalogResponse getCatalog(
            String category,
            String brand,
            String silhouette,
            String size,
            String query,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int pageSize) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        Page<Shoe> shoePage = shoeRepository.findCatalogItems(
                normalizeFilter(category),
                normalizeFilter(brand),
                normalizeFilter(silhouette),
                normalizeFilter(size),
                normalizeFilter(query),
                minPrice,
                maxPrice,
                PageRequest.of(safePage - 1, safePageSize, resolveSort(sort)));

        List<Shoe> pageShoes = shoePage.getContent();
        Map<Long, ReviewMetrics> reviewMetricsByShoe = loadReviewMetrics(pageShoes.stream().map(Shoe::getId).toList());
        List<ShoeCardResponse> items = pageShoes.stream()
                .map(shoe -> toCardResponse(shoe, reviewMetricsByShoe.getOrDefault(shoe.getId(), ReviewMetrics.ZERO)))
                .toList();

        List<CollectionResponse> featuredCollections = collectionService.listActive().stream().limit(2).toList();
        CatalogResponse.PriceRange priceRange = new CatalogResponse.PriceRange(
                defaultZero(shoeRepository.findMinPrice()),
                defaultZero(shoeRepository.findMaxPrice()));

        return new CatalogResponse(
                items,
                new CatalogResponse.CatalogPagination(
                        safePage,
                        safePageSize,
                        shoePage.getTotalElements(),
                        Math.max(1, shoePage.getTotalPages())),
                new CatalogResponse.CatalogFacets(
                        shoeRepository.findDistinctCategorySlugs(),
                        shoeRepository.findDistinctBrands(),
                        shoeRepository.findDistinctSilhouettes(),
                        shoeRepository.findDistinctSizeLabels(),
                        priceRange),
                campaignService.getFirstActiveByPlacement("CATALOG_HERO"),
                promotionService.getFeaturedPromotion(),
                featuredCollections);
    }

    private Map<Long, ReviewMetrics> loadReviewMetrics(Collection<Long> shoeIds) {
        if (shoeIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, ReviewMetrics> metricsByShoe = new HashMap<>();
        reviewRepository.findPublishedStatsByShoeIds(shoeIds)
                .forEach(stat -> metricsByShoe.put(
                        stat.getShoeId(),
                        new ReviewMetrics(defaultZero(stat.getAverageRating()), stat.getReviewCount() == null ? 0L : stat.getReviewCount())));
        return metricsByShoe;
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank() || "featured".equalsIgnoreCase(sort)) {
            return Sort.by(
                    Sort.Order.desc("featured"),
                    Sort.Order.desc("newArrival"),
                    Sort.Order.desc("id"));
        }
        return switch (sort.toLowerCase(Locale.ROOT)) {
            case "price-asc" -> Sort.by(Sort.Order.asc("price"), Sort.Order.asc("name"));
            case "price-desc" -> Sort.by(Sort.Order.desc("price"), Sort.Order.asc("name"));
            case "name-asc" -> Sort.by(Sort.Order.asc("name"));
            case "newest" -> Sort.by(Sort.Order.desc("newArrival"), Sort.Order.desc("id"));
            default -> Sort.by(
                    Sort.Order.desc("featured"),
                    Sort.Order.desc("newArrival"),
                    Sort.Order.desc("id"));
        };
    }

    private String normalizeFilter(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private double defaultZero(Double value) {
        return value == null ? 0D : value;
    }

    private ShoeCardResponse toCardResponse(Shoe shoe, ReviewMetrics metrics) {
        return new ShoeCardResponse(
                shoe.getId(),
                shoe.getName(),
                shoe.getSlug(),
                shoe.getBrand(),
                shoe.getSilhouette(),
                shoe.getShortDescription(),
                shoe.getPrice(),
                shoe.getPrimaryImage(),
                shoe.getSecondaryImage(),
                shoe.getCategory().getSlug(),
                shoe.getCategory().getName(),
                fallbackCampaignBadge(shoe),
                shoe.isFeatured(),
                shoe.isNewArrival(),
                shoe.isBestSeller(),
                metrics.averageRating(),
                metrics.reviewCount());
    }

    private String fallbackCampaignBadge(Shoe shoe) {
        if (shoe.getCampaignBadge() != null && !shoe.getCampaignBadge().isBlank()) {
            return shoe.getCampaignBadge();
        }
        if (shoe.isFeatured()) {
            return "Zephyr Select";
        }
        if (shoe.isNewArrival()) {
            return "New Season";
        }
        if (shoe.isBestSeller()) {
            return "Top Seller";
        }
        return "Curated Pair";
    }

    private record ReviewMetrics(double averageRating, long reviewCount) {
        private static final ReviewMetrics ZERO = new ReviewMetrics(0D, 0L);
    }
}
