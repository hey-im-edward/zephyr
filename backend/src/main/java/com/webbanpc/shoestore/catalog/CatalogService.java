package com.webbanpc.shoestore.catalog;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.campaign.CampaignService;
import com.webbanpc.shoestore.collection.CollectionResponse;
import com.webbanpc.shoestore.collection.CollectionService;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.shoe.ShoeService;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final ShoeRepository shoeRepository;
    private final ShoeService shoeService;
    private final CampaignService campaignService;
    private final PromotionService promotionService;
    private final CollectionService collectionService;

    public CatalogService(
            ShoeRepository shoeRepository,
            ShoeService shoeService,
            CampaignService campaignService,
            PromotionService promotionService,
            CollectionService collectionService) {
        this.shoeRepository = shoeRepository;
        this.shoeService = shoeService;
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
        List<Shoe> allShoes = shoeRepository.findAllByOrderByFeaturedDescNewArrivalDescIdDesc();
        List<Shoe> filtered = allShoes.stream()
                .filter(shoe -> category == null || category.isBlank() || shoe.getCategory().getSlug().equalsIgnoreCase(category))
                .filter(shoe -> brand == null || brand.isBlank() || shoe.getBrand().equalsIgnoreCase(brand))
                .filter(shoe -> silhouette == null || silhouette.isBlank() || shoe.getSilhouette().equalsIgnoreCase(silhouette))
                .filter(shoe -> query == null || query.isBlank() || contains(shoe, query))
                .filter(shoe -> minPrice == null || shoe.getPrice().compareTo(minPrice) >= 0)
                .filter(shoe -> maxPrice == null || shoe.getPrice().compareTo(maxPrice) <= 0)
                .filter(shoe -> size == null || size.isBlank() || shoe.getSizeStocks().stream()
                        .anyMatch(stock -> stock.getSizeLabel().equalsIgnoreCase(size) && stock.getStockQuantity() > 0))
                .sorted(resolveSort(sort))
                .toList();

        long totalItems = filtered.size();
        int safePage = Math.max(page, 1);
        int safePageSize = Math.max(pageSize, 1);
        int fromIndex = Math.min((safePage - 1) * safePageSize, filtered.size());
        int toIndex = Math.min(fromIndex + safePageSize, filtered.size());

        List<ShoeCardResponse> items = filtered.subList(fromIndex, toIndex).stream()
                .map(shoe -> shoeService.getById(shoe.getId()))
                .map(detail -> new ShoeCardResponse(
                        detail.id(),
                        detail.name(),
                        detail.slug(),
                        detail.brand(),
                        detail.silhouette(),
                        detail.shortDescription(),
                        detail.price(),
                        detail.primaryImage(),
                        detail.secondaryImage(),
                        detail.categorySlug(),
                        detail.categoryName(),
                        detail.campaignBadge(),
                        detail.featured(),
                        detail.newArrival(),
                        detail.bestSeller(),
                        detail.averageRating(),
                        detail.reviewCount()))
                .toList();

        List<CollectionResponse> featuredCollections = collectionService.listActive().stream().limit(2).toList();
        CatalogResponse.PriceRange priceRange = new CatalogResponse.PriceRange(
                allShoes.stream().map(Shoe::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO),
                allShoes.stream().map(Shoe::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));

        return new CatalogResponse(
                items,
                new CatalogResponse.CatalogPagination(
                        safePage,
                        safePageSize,
                        totalItems,
                        (int) Math.max(1, Math.ceil((double) totalItems / safePageSize))),
                new CatalogResponse.CatalogFacets(
                        allShoes.stream().map(shoe -> shoe.getCategory().getSlug()).distinct().sorted().toList(),
                        allShoes.stream().map(Shoe::getBrand).distinct().sorted().toList(),
                        allShoes.stream().map(Shoe::getSilhouette).distinct().sorted().toList(),
                        allShoes.stream()
                                .flatMap(shoe -> shoe.getSizeStocks().stream())
                                .map(stock -> stock.getSizeLabel())
                                .distinct()
                                .sorted()
                                .toList(),
                        priceRange),
                campaignService.getFirstActiveByPlacement("CATALOG_HERO"),
                promotionService.getFeaturedPromotion(),
                featuredCollections);
    }

    private boolean contains(Shoe shoe, String query) {
        String normalized = query.trim().toLowerCase(Locale.ROOT);
        return shoe.getName().toLowerCase(Locale.ROOT).contains(normalized)
                || shoe.getBrand().toLowerCase(Locale.ROOT).contains(normalized)
                || shoe.getSilhouette().toLowerCase(Locale.ROOT).contains(normalized)
                || shoe.getCategory().getName().toLowerCase(Locale.ROOT).contains(normalized);
    }

    private Comparator<Shoe> resolveSort(String sort) {
        if (sort == null || sort.isBlank() || "featured".equalsIgnoreCase(sort)) {
            return Comparator.comparing(Shoe::isFeatured).reversed()
                    .thenComparing(Shoe::isNewArrival).reversed()
                    .thenComparing(Shoe::getId, Comparator.reverseOrder());
        }
        return switch (sort.toLowerCase(Locale.ROOT)) {
            case "price-asc" -> Comparator.comparing(Shoe::getPrice).thenComparing(Shoe::getName);
            case "price-desc" -> Comparator.comparing(Shoe::getPrice, Comparator.reverseOrder()).thenComparing(Shoe::getName);
            case "name-asc" -> Comparator.comparing(Shoe::getName);
            case "newest" -> Comparator.comparing(Shoe::isNewArrival).reversed().thenComparing(Shoe::getId, Comparator.reverseOrder());
            default -> Comparator.comparing(Shoe::isFeatured).reversed()
                    .thenComparing(Shoe::isNewArrival).reversed()
                    .thenComparing(Shoe::getId, Comparator.reverseOrder());
        };
    }
}
