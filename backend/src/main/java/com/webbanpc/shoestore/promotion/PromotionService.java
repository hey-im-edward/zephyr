package com.webbanpc.shoestore.promotion;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    public List<PromotionResponse> listActive() {
        return promotionRepository.findAllByActiveTrueOrderByFeaturedDescTitleAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PromotionResponse> listForAdmin() {
        return promotionRepository.findAllByOrderByFeaturedDescTitleAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PromotionResponse getFeaturedPromotion() {
        return promotionRepository.findFirstByActiveTrueAndFeaturedTrueOrderByIdAsc()
                .map(this::toResponse)
                .orElse(null);
    }

    public Promotion findEntityByCode(String code) {
        return promotionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + code));
    }

    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .code(request.code().trim().toUpperCase())
                .title(request.title())
                .description(request.description())
                .badge(request.badge())
                .discountLabel(request.discountLabel())
                .heroTone(request.heroTone())
                .active(request.active())
                .featured(request.featured())
                .build();
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponse update(@NonNull Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        promotion.setCode(request.code().trim().toUpperCase());
        promotion.setTitle(request.title());
        promotion.setDescription(request.description());
        promotion.setBadge(request.badge());
        promotion.setDiscountLabel(request.discountLabel());
        promotion.setHeroTone(request.heroTone());
        promotion.setActive(request.active());
        promotion.setFeatured(request.featured());
        return toResponse(promotion);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
        promotionRepository.delete(promotion);
    }

    private PromotionResponse toResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getCode(),
                promotion.getTitle(),
                promotion.getDescription(),
                promotion.getBadge(),
                promotion.getDiscountLabel(),
                promotion.getHeroTone(),
                promotion.isActive(),
                promotion.isFeatured());
    }
}
