package com.webbanpc.shoestore.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record OrderItemRequest(
        @NotBlank String shoeSlug,
        @NotBlank String sizeLabel,
        @Min(1) int quantity) {
}
