package com.webbanpc.shoestore.order;

public enum PaymentMethod {
    COD,
    BANK_TRANSFER,
    CARD,
    BANK_QR,
    EWALLET;

    public boolean isOnline() {
        return this == CARD || this == BANK_QR || this == EWALLET;
    }
}
