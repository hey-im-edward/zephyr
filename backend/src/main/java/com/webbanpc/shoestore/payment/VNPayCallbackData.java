package com.webbanpc.shoestore.payment;

public record VNPayCallbackData(
        String txnRef,
        long amount,
        String responseCode,
        String transactionStatus,
        String transactionNo,
        String bankCode) {

    public boolean isSuccess() {
        return "00".equals(responseCode) && "00".equals(transactionStatus);
    }
}