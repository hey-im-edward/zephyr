package com.webbanpc.shoestore.address;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        @NotBlank String label,
        @NotBlank String recipientName,
        @NotBlank String phone,
        @NotBlank String addressLine,
        @NotBlank String city,
        boolean defaultAddress) {
}
