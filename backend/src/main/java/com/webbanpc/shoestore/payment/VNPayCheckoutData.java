package com.webbanpc.shoestore.payment;

public record VNPayCheckoutData(
        String checkoutUrl,
        String txnRef,
        long amount) {
}