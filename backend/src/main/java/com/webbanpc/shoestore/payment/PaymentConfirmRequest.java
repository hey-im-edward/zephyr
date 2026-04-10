package com.webbanpc.shoestore.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentConfirmRequest(
        @NotBlank String orderCode,
        @NotBlank String referenceToken) {
}
