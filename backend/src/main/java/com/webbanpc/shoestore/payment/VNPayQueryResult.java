package com.webbanpc.shoestore.payment;

import java.time.LocalDateTime;

public record VNPayQueryResult(
        String txnRef,
        long amount,
        String responseCode,
        String transactionStatus,
        String transactionNo,
        String bankCode,
        LocalDateTime paidAt,
        String message) {
}
