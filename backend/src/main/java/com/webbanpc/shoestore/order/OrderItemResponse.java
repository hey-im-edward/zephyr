package com.webbanpc.shoestore.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        String shoeSlug,
        String shoeName,
        String sizeLabel,
        BigDecimal price,
        int quantity,
        BigDecimal lineTotal) {
}
