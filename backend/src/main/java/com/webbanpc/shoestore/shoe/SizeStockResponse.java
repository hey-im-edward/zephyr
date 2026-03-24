package com.webbanpc.shoestore.shoe;

public record SizeStockResponse(
        String sizeLabel,
        int stockQuantity,
        boolean available) {
}
