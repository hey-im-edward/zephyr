package com.webbanpc.shoestore.shoe;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

                @EntityGraph(attributePaths = { "category" })
                @Query(value = """
                                                select distinct s
                                                from Shoe s
                                                join s.category c
                                                where (:category is null or lower(c.slug) = lower(:category))
                                                        and (:brand is null or lower(s.brand) = lower(:brand))
                                                        and (:silhouette is null or lower(s.silhouette) = lower(:silhouette))
                                                        and (:query is null
                                                                or lower(s.name) like lower(concat('%', :query, '%'))
                                                                or lower(s.brand) like lower(concat('%', :query, '%'))
                                                                or lower(s.silhouette) like lower(concat('%', :query, '%'))
                                                                or lower(c.name) like lower(concat('%', :query, '%')))
                                                        and (:minPrice is null or s.price >= :minPrice)
                                                        and (:maxPrice is null or s.price <= :maxPrice)
                                                        and (:size is null or exists (
                                                                                select 1
                                                                                from ShoeSizeStock stock
                                                                                where stock.shoe = s
                                                                                        and lower(stock.sizeLabel) = lower(:size)
                                                                                        and stock.stockQuantity > 0
                                                        ))
                                                """,
                                                countQuery = """
                                                select count(s)
                                                from Shoe s
                                                join s.category c
                                                where (:category is null or lower(c.slug) = lower(:category))
                                                        and (:brand is null or lower(s.brand) = lower(:brand))
                                                        and (:silhouette is null or lower(s.silhouette) = lower(:silhouette))
                                                        and (:query is null
                                                                or lower(s.name) like lower(concat('%', :query, '%'))
                                                                or lower(s.brand) like lower(concat('%', :query, '%'))
                                                                or lower(s.silhouette) like lower(concat('%', :query, '%'))
                                                                or lower(c.name) like lower(concat('%', :query, '%')))
                                                        and (:minPrice is null or s.price >= :minPrice)
                                                        and (:maxPrice is null or s.price <= :maxPrice)
                                                        and (:size is null or exists (
                                                                                select 1
                                                                                from ShoeSizeStock stock
                                                                                where stock.shoe = s
                                                                                        and lower(stock.sizeLabel) = lower(:size)
                                                                                        and stock.stockQuantity > 0
                                                        ))
                                                """)
                Page<Shoe> findCatalogItems(
                                                @Param("category") String category,
                                                @Param("brand") String brand,
                                                @Param("silhouette") String silhouette,
                                                @Param("size") String size,
                                                @Param("query") String query,
                                                @Param("minPrice") BigDecimal minPrice,
                                                @Param("maxPrice") BigDecimal maxPrice,
                                                Pageable pageable);

                @Query("select distinct c.slug from Shoe s join s.category c order by c.slug")
                List<String> findDistinctCategorySlugs();

                @Query("select distinct s.brand from Shoe s order by s.brand")
                List<String> findDistinctBrands();

                @Query("select distinct s.silhouette from Shoe s order by s.silhouette")
                List<String> findDistinctSilhouettes();

                @Query("select distinct stock.sizeLabel from ShoeSizeStock stock order by stock.sizeLabel")
                List<String> findDistinctSizeLabels();

                @Query("select min(s.price) from Shoe s")
                BigDecimal findMinPrice();

                @Query("select max(s.price) from Shoe s")
                BigDecimal findMaxPrice();
}
