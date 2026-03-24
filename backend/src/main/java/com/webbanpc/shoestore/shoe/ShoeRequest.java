package com.webbanpc.shoestore.shoe;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ShoeRequest(
        @NotBlank @Size(max = 60) String sku,
        @NotBlank @Size(max = 140) String name,
        @NotBlank @Size(max = 80) String brand,
        @NotBlank @Size(max = 80) String silhouette,
        @NotBlank @Size(max = 255) String shortDescription,
        @NotBlank String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @NotBlank String primaryImage,
        @NotBlank String secondaryImage,
        @NotEmpty List<@Valid SizeStockRequest> sizeStocks,
        @NotBlank String accentColors,
        @NotBlank String highlights,
        boolean featured,
        boolean newArrival,
        boolean bestSeller,
        @NotBlank String categorySlug) {
}
