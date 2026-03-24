package com.webbanpc.shoestore.shoe;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SizeStockRequest(
        @NotBlank String sizeLabel,
        @Min(0) int stockQuantity) {
}
