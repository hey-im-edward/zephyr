package com.webbanpc.shoestore.shoe;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoeSizeStockRepository extends JpaRepository<ShoeSizeStock, Long> {

    Optional<ShoeSizeStock> findByShoeSlugAndSizeLabel(String shoeSlug, String sizeLabel);
}
