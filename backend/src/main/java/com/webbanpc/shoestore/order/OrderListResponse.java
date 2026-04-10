package com.webbanpc.shoestore.order;

import java.util.List;

public record OrderListResponse(
        List<OrderResponse> items,
        OrderPagination pagination) {

    public record OrderPagination(
            int page,
            int pageSize,
            long totalItems,
            int totalPages) {
    }
}