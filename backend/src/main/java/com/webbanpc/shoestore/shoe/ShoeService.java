package com.webbanpc.shoestore.shoe;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.category.Category;
import com.webbanpc.shoestore.category.CategoryService;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;
import com.webbanpc.shoestore.review.ReviewService;

@Service
@Transactional(readOnly = true)
public class ShoeService {

    private final ShoeRepository shoeRepository;
    private final CategoryService categoryService;
    private final ReviewService reviewService;

    public ShoeService(ShoeRepository shoeRepository, CategoryService categoryService, ReviewService reviewService) {
        this.shoeRepository = shoeRepository;
        this.categoryService = categoryService;
        this.reviewService = reviewService;
    }

    public List<ShoeCardResponse> search(String categorySlug, Boolean featured, String query) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();

        return shoeRepository.search(categorySlug, featured, normalizedQuery)
                .stream()
                .map(this::toCardResponse)
                .toList();
    }

    public List<ShoeDetailResponse> getAllForAdmin() {
        return shoeRepository.findAllByOrderByFeaturedDescNewArrivalDescIdDesc()
                .stream()
                .map(this::toDetailResponse)
                .toList();
    }

    public ShoeDetailResponse getBySlug(String slug) {
        Shoe shoe = shoeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + slug));

        return toDetailResponse(Objects.requireNonNull(shoe));
    }

    public ShoeDetailResponse getById(@NonNull Long id) {
        Shoe shoe = Objects.requireNonNull(shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id)));

        return toDetailResponse(shoe);
    }

    @Transactional
    public ShoeDetailResponse create(ShoeRequest request) {
        Category category = categoryService.findEntityBySlug(request.categorySlug());

        Shoe shoe = Shoe.builder()
                .sku(request.sku())
                .name(request.name())
                .slug(SlugUtils.slugify(request.name()))
                .brand(request.brand())
                .silhouette(request.silhouette())
                .shortDescription(request.shortDescription())
                .description(request.description())
                .price(request.price())
                .primaryImage(request.primaryImage())
                .secondaryImage(request.secondaryImage())
                .availableSizes(joinSizeLabels(request.sizeStocks()))
                .accentColors(request.accentColors())
                .highlights(request.highlights())
                .featured(request.featured())
                .newArrival(request.newArrival())
                .bestSeller(request.bestSeller())
                .category(category)
                .build();
        syncSizeStocks(shoe, request.sizeStocks());

        Shoe savedShoe = Objects.requireNonNull(shoeRepository.save(Objects.requireNonNull(shoe)));
        return toDetailResponse(savedShoe);
    }

    @Transactional
    public ShoeDetailResponse update(@NonNull Long id, ShoeRequest request) {
        Shoe shoe = Objects.requireNonNull(shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id)));

        Category category = categoryService.findEntityBySlug(request.categorySlug());

        shoe.setSku(request.sku());
        shoe.setName(request.name());
        shoe.setSlug(SlugUtils.slugify(request.name()));
        shoe.setBrand(request.brand());
        shoe.setSilhouette(request.silhouette());
        shoe.setShortDescription(request.shortDescription());
        shoe.setDescription(request.description());
        shoe.setPrice(request.price());
        shoe.setPrimaryImage(request.primaryImage());
        shoe.setSecondaryImage(request.secondaryImage());
        shoe.setAvailableSizes(joinSizeLabels(request.sizeStocks()));
        shoe.setAccentColors(request.accentColors());
        shoe.setHighlights(request.highlights());
        shoe.setFeatured(request.featured());
        shoe.setNewArrival(request.newArrival());
        shoe.setBestSeller(request.bestSeller());
        shoe.setCategory(category);
        syncSizeStocks(shoe, request.sizeStocks());

        return toDetailResponse(shoe);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        Shoe shoe = Objects.requireNonNull(shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id)));
        shoeRepository.delete(Objects.requireNonNull(shoe));
    }

    private ShoeCardResponse toCardResponse(@NonNull Shoe shoe) {
        return new ShoeCardResponse(
                Objects.requireNonNull(shoe.getId()),
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
                reviewService.averageRating(shoe.getId()),
                reviewService.reviewCount(shoe.getId()));
    }

    private ShoeDetailResponse toDetailResponse(@NonNull Shoe shoe) {
        return new ShoeDetailResponse(
                Objects.requireNonNull(shoe.getId()),
                shoe.getSku(),
                shoe.getName(),
                shoe.getSlug(),
                shoe.getBrand(),
                shoe.getSilhouette(),
                shoe.getShortDescription(),
                shoe.getDescription(),
                shoe.getPrice(),
                shoe.getPrimaryImage(),
                shoe.getSecondaryImage(),
                galleryImages(shoe),
                shoe.getVideoUrl(),
                availableSizes(shoe),
                sizeStockResponses(shoe),
                splitField(shoe.getAccentColors()),
                splitField(shoe.getHighlights()),
                shoe.getFitNote() != null ? shoe.getFitNote() : defaultFitNote(shoe),
                shoe.getDeliveryNote() != null ? shoe.getDeliveryNote() : defaultDeliveryNote(),
                fallbackCampaignBadge(shoe),
                shoe.getCategory().getSlug(),
                shoe.getCategory().getName(),
                shoe.isFeatured(),
                shoe.isNewArrival(),
                shoe.isBestSeller(),
                totalStock(shoe),
                totalStock(shoe) > 0,
                reviewService.averageRating(shoe.getId()),
                reviewService.reviewCount(shoe.getId()));
    }

    private List<String> splitField(String input) {
        if (input == null || input.isBlank()) {
            return List.of();
        }
        return Arrays.stream(input.split("\\|"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private List<String> galleryImages(Shoe shoe) {
        List<String> images = splitField(shoe.getGalleryImages());
        return images.isEmpty() ? List.of(shoe.getPrimaryImage(), shoe.getSecondaryImage()) : images;
    }

    private void syncSizeStocks(Shoe shoe, List<SizeStockRequest> sizeStocks) {
        shoe.getSizeStocks().clear();
        sizeStocks.stream()
                .sorted(Comparator.comparing(SizeStockRequest::sizeLabel, sizeComparator()))
                .forEach(size -> shoe.getSizeStocks().add(ShoeSizeStock.builder()
                        .shoe(shoe)
                        .sizeLabel(size.sizeLabel().trim())
                        .stockQuantity(size.stockQuantity())
                        .build()));
    }

    private List<SizeStockResponse> sizeStockResponses(Shoe shoe) {
        if (shoe.getSizeStocks().isEmpty()) {
            return availableSizes(shoe).stream()
                    .map(size -> new SizeStockResponse(size, 0, true))
                    .toList();
        }

        return shoe.getSizeStocks().stream()
                .sorted(Comparator.comparing(ShoeSizeStock::getSizeLabel, sizeComparator()))
                .map(size -> new SizeStockResponse(size.getSizeLabel(), size.getStockQuantity(), size.getStockQuantity() > 0))
                .toList();
    }

    private List<String> availableSizes(Shoe shoe) {
        if (!shoe.getSizeStocks().isEmpty()) {
            return shoe.getSizeStocks().stream()
                    .filter(size -> size.getStockQuantity() > 0)
                    .sorted(Comparator.comparing(ShoeSizeStock::getSizeLabel, sizeComparator()))
                    .map(ShoeSizeStock::getSizeLabel)
                    .toList();
        }

        return splitField(shoe.getAvailableSizes());
    }

    private int totalStock(Shoe shoe) {
        return shoe.getSizeStocks().stream()
                .map(ShoeSizeStock::getStockQuantity)
                .collect(Collectors.summingInt(Integer::intValue));
    }

    private String joinSizeLabels(List<SizeStockRequest> sizeStocks) {
        return sizeStocks.stream()
                .sorted(Comparator.comparing(SizeStockRequest::sizeLabel, sizeComparator()))
                .map(SizeStockRequest::sizeLabel)
                .map(String::trim)
                .collect(Collectors.joining("|"));
    }

    private Comparator<String> sizeComparator() {
        return Comparator.comparingInt((String size) -> {
            try {
                return Integer.parseInt(size.trim());
            } catch (NumberFormatException ignored) {
                return Integer.MAX_VALUE;
            }
        }).thenComparing(String::trim);
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

    private String defaultFitNote(Shoe shoe) {
        if ("trail".equalsIgnoreCase(shoe.getCategory().getSlug())) {
            return "Phom ôm chắc để giữ bàn chân ổn định trên bề mặt hỗn hợp.";
        }
        if ("running".equalsIgnoreCase(shoe.getCategory().getSlug())) {
            return "Nên đi đúng size thường dùng để giữ nhịp chuyển động tự nhiên.";
        }
        return "Phom cân bằng cho nhu cầu mặc hằng ngày, ưu tiên true-to-size.";
    }

    private String defaultDeliveryNote() {
        return "Hỗ trợ giao nhanh nội thành, đổi size theo tồn kho và giữ trải nghiệm sau mua rõ ràng.";
    }
}
