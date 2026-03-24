package com.webbanpc.shoestore.shoe;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShoeRepository extends JpaRepository<Shoe, Long> {

    @EntityGraph(attributePaths = { "category", "sizeStocks" })
    Optional<Shoe> findBySlug(String slug);

    @EntityGraph(attributePaths = { "category", "sizeStocks" })
    Optional<Shoe> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = { "category", "sizeStocks" })
    List<Shoe> findAllByOrderByFeaturedDescNewArrivalDescIdDesc();

    @Query("""
            select s
            from Shoe s
            join fetch s.category c
            where (:categorySlug is null or c.slug = :categorySlug)
              and (:featured is null or s.featured = :featured)
              and (:query is null
                or lower(s.name) like lower(concat('%', :query, '%'))
                or lower(s.brand) like lower(concat('%', :query, '%'))
                or lower(s.silhouette) like lower(concat('%', :query, '%')))
            order by s.featured desc, s.newArrival desc, s.id desc
            """)
    List<Shoe> search(
            @Param("categorySlug") String categorySlug,
            @Param("featured") Boolean featured,
            @Param("query") String query);
}
