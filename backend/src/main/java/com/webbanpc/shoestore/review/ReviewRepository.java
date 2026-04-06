package com.webbanpc.shoestore.review;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    interface ReviewStatsView {
        Long getShoeId();

        Double getAverageRating();

        Long getReviewCount();
    }

    @EntityGraph(attributePaths = { "user", "shoe" })
    List<Review> findAllByShoeSlugAndStatusOrderByCreatedAtDesc(String slug, ReviewStatus status);

    @EntityGraph(attributePaths = { "user", "shoe" })
    List<Review> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = { "user", "shoe" })
    Optional<Review> findByUserIdAndShoeSlug(Long userId, String slug);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.shoe.id = :shoeId and r.status = 'PUBLISHED'")
    Double averageRatingByShoeId(Long shoeId);

        @Query("""
                        select r.shoe.id as shoeId,
                                     coalesce(avg(r.rating), 0) as averageRating,
                                     count(r.id) as reviewCount
                        from Review r
                        where r.status = 'PUBLISHED'
                            and r.shoe.id in :shoeIds
                        group by r.shoe.id
                        """)
        List<ReviewStatsView> findPublishedStatsByShoeIds(Collection<Long> shoeIds);

    long countByShoeIdAndStatus(Long shoeId, ReviewStatus status);
}
