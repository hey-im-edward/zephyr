package com.webbanpc.shoestore.shoe;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.category.Category;
import com.webbanpc.shoestore.category.CategoryService;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;

@Service
@Transactional(readOnly = true)
public class ShoeService {

    private final ShoeRepository shoeRepository;
    private final CategoryService categoryService;

    public ShoeService(ShoeRepository shoeRepository, CategoryService categoryService) {
        this.shoeRepository = shoeRepository;
        this.categoryService = categoryService;
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

        return toDetailResponse(shoe);
    }

    public ShoeDetailResponse getById(Long id) {
        Shoe shoe = shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id));

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

        return toDetailResponse(shoeRepository.save(shoe));
    }

    @Transactional
    public ShoeDetailResponse update(Long id, ShoeRequest request) {
        Shoe shoe = shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id));

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
    public void delete(Long id) {
        Shoe shoe = shoeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + id));
        shoeRepository.delete(shoe);
    }

    private ShoeCardResponse toCardResponse(Shoe shoe) {
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
                shoe.isFeatured(),
                shoe.isNewArrival(),
                shoe.isBestSeller());
    }

    private ShoeDetailResponse toDetailResponse(Shoe shoe) {
        return new ShoeDetailResponse(
                shoe.getId(),
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
                availableSizes(shoe),
                sizeStockResponses(shoe),
                splitField(shoe.getAccentColors()),
                splitField(shoe.getHighlights()),
                shoe.getCategory().getSlug(),
                shoe.getCategory().getName(),
                shoe.isFeatured(),
                shoe.isNewArrival(),
                shoe.isBestSeller(),
                totalStock(shoe),
                totalStock(shoe) > 0);
    }

    private List<String> splitField(String input) {
        return Arrays.stream(input.split("\\|"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
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
}
