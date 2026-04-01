package com.webbanpc.shoestore.recommendation;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final ShoeRecommendationRepository shoeRecommendationRepository;

    public RecommendationService(ShoeRecommendationRepository shoeRecommendationRepository) {
        this.shoeRecommendationRepository = shoeRecommendationRepository;
    }

    public List<RecommendationResponse> listForShoe(String slug) {
        return shoeRecommendationRepository.findAllBySourceShoeSlugOrderBySortOrderAscIdAsc(slug)
                .stream()
                .map(recommendation -> new RecommendationResponse(
                        recommendation.getId(),
                        recommendation.getReasonLabel(),
                        recommendation.getTargetShoe().getId(),
                        recommendation.getTargetShoe().getSlug(),
                        recommendation.getTargetShoe().getName(),
                        recommendation.getTargetShoe().getBrand(),
                        recommendation.getTargetShoe().getSilhouette(),
                        recommendation.getTargetShoe().getPrimaryImage(),
                        recommendation.getTargetShoe().getPrice(),
                        recommendation.getTargetShoe().getCategory().getName()))
                .toList();
    }
}
