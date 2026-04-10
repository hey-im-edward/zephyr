package com.webbanpc.shoestore.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentSessionRequest(@NotBlank String orderCode) {
}
