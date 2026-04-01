package com.webbanpc.shoestore.shipping;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ShippingMethodRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @DecimalMin("0.00") BigDecimal fee,
        @NotBlank String etaLabel,
        boolean active,
        int priority) {
}
