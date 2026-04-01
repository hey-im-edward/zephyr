package com.webbanpc.shoestore.wishlist;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = { "shoe", "shoe.category" })
    List<WishlistItem> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUserIdAndShoeSlug(Long userId, String slug);

    boolean existsByUserIdAndShoeSlug(Long userId, String slug);
}
