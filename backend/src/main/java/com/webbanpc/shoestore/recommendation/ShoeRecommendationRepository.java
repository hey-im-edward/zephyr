package com.webbanpc.shoestore.recommendation;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoeRecommendationRepository extends JpaRepository<ShoeRecommendation, Long> {

    @EntityGraph(attributePaths = { "sourceShoe", "targetShoe", "targetShoe.category" })
    List<ShoeRecommendation> findAllBySourceShoeSlugOrderBySortOrderAscIdAsc(String slug);
}
