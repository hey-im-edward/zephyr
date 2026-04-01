package com.webbanpc.shoestore.address;

public record AddressResponse(
        Long id,
        String label,
        String recipientName,
        String phone,
        String addressLine,
        String city,
        boolean defaultAddress) {
}
