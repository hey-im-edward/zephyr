package com.webbanpc.shoestore.admin;

import java.math.BigDecimal;

public record AdminDashboardResponse(
        long categoryCount,
        long shoeCount,
        long userCount,
        long orderCount,
        long pendingOrderCount,
        BigDecimal totalRevenue) {
}
