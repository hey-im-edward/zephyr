package com.webbanpc.shoestore.collection;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MerchCollectionRepository extends JpaRepository<MerchCollection, Long> {

    @EntityGraph(attributePaths = { "items", "items.shoe", "items.shoe.category" })
    List<MerchCollection> findAllByOrderBySortOrderAscIdAsc();

    @EntityGraph(attributePaths = { "items", "items.shoe", "items.shoe.category" })
    List<MerchCollection> findAllByActiveTrueOrderBySortOrderAscIdAsc();

    @EntityGraph(attributePaths = { "items", "items.shoe", "items.shoe.category" })
    Optional<MerchCollection> findBySlug(String slug);
}
