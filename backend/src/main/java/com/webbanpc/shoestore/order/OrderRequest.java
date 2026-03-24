package com.webbanpc.shoestore.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record OrderRequest(
        @NotBlank String customerName,
        @Email @NotBlank String email,
        @NotBlank String phone,
        @NotBlank String addressLine,
        @NotBlank String city,
        String notes,
        @NotNull PaymentMethod paymentMethod,
        @NotEmpty List<@Valid OrderItemRequest> items) {
}
