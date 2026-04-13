package com.webbanpc.shoestore.payment;

public record VNPayIpnResponse(
        String RspCode,
        String Message) {

    public static VNPayIpnResponse success() {
        return new VNPayIpnResponse("00", "Confirm Success");
    }

    public static VNPayIpnResponse orderNotFound() {
        return new VNPayIpnResponse("01", "Order Not Found");
    }

    public static VNPayIpnResponse alreadyConfirmed() {
        return new VNPayIpnResponse("02", "Order already confirmed");
    }

    public static VNPayIpnResponse invalidAmount() {
        return new VNPayIpnResponse("04", "Invalid Amount");
    }

    public static VNPayIpnResponse invalidSignature() {
        return new VNPayIpnResponse("97", "Invalid Checksum");
    }

    public static VNPayIpnResponse systemError() {
        return new VNPayIpnResponse("99", "Unknown error");
    }
}