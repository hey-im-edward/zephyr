package com.webbanpc.shoestore.promotion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findAllByOrderByFeaturedDescTitleAsc();

    List<Promotion> findAllByActiveTrueOrderByFeaturedDescTitleAsc();

    Optional<Promotion> findByCode(String code);

    Optional<Promotion> findFirstByActiveTrueAndFeaturedTrueOrderByIdAsc();
}
