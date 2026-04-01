package com.webbanpc.shoestore.shipping;

import java.math.BigDecimal;

public record ShippingMethodResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal fee,
        String etaLabel,
        boolean active,
        int priority) {
}
