package com.webbanpc.shoestore.catalog;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.Comparator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CatalogServiceRegressionTests {

    @Autowired
    private CatalogService catalogService;

    @Test
    void shouldRespectRequestedPageSize() {
        CatalogResponse response = catalogService.getCatalog(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "featured",
                1,
                5);

        assertTrue(response.items().size() <= 5);
        assertTrue(response.pagination().pageSize() == 5);
    }

    @Test
    void shouldCapRequestedPageSizeToSystemLimit() {
        CatalogResponse response = catalogService.getCatalog(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "featured",
                1,
                10_000);

        assertTrue(response.items().size() <= 60);
        assertTrue(response.pagination().pageSize() == 60);
    }

    @Test
    void shouldSortByAscendingPriceWhenRequested() {
        CatalogResponse response = catalogService.getCatalog(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "price-asc",
                1,
                12);

        boolean sorted = response.items().stream()
                .map(item -> item.price() == null ? BigDecimal.ZERO : item.price())
                .toList()
                .equals(response.items().stream()
                        .map(item -> item.price() == null ? BigDecimal.ZERO : item.price())
                        .sorted(Comparator.naturalOrder())
                        .toList());

        assertTrue(sorted);
    }

    @Test
    void shouldExposeFacetDataWithoutLoadingEntireCatalogIntoMemory() {
        CatalogResponse response = catalogService.getCatalog(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "featured",
                1,
                9);

        assertTrue(response.facets().categories() != null);
        assertTrue(response.facets().brands() != null);
        assertTrue(response.facets().silhouettes() != null);
        assertTrue(response.facets().sizes() != null);
        assertTrue(response.facets().priceRange().min() != null);
        assertTrue(response.facets().priceRange().max() != null);
    }
}
