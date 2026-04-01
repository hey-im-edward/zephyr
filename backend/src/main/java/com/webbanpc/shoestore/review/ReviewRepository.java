package com.webbanpc.shoestore.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = { "user", "shoe" })
    List<Review> findAllByShoeSlugAndStatusOrderByCreatedAtDesc(String slug, ReviewStatus status);

    @EntityGraph(attributePaths = { "user", "shoe" })
    List<Review> findAllByOrderByUpdatedAtDesc();

    Optional<Review> findByUserIdAndShoeSlug(Long userId, String slug);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.shoe.id = :shoeId and r.status = 'PUBLISHED'")
    Double averageRatingByShoeId(Long shoeId);

    long countByShoeIdAndStatus(Long shoeId, ReviewStatus status);
}
