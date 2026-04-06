package com.webbanpc.shoestore.shoe;

import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShoeSizeStockRepository extends JpaRepository<ShoeSizeStock, Long> {

    @EntityGraph(attributePaths = { "shoe" })
    Optional<ShoeSizeStock> findByShoeSlugAndSizeLabel(String shoeSlug, String sizeLabel);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = { "shoe" })
    @Query("""
            select stock
            from ShoeSizeStock stock
            where stock.shoe.slug = :shoeSlug
              and lower(stock.sizeLabel) = lower(:sizeLabel)
            """)
    Optional<ShoeSizeStock> findByShoeSlugAndSizeLabelForUpdate(
            @Param("shoeSlug") String shoeSlug,
            @Param("sizeLabel") String sizeLabel);
}
