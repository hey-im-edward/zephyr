package com.webbanpc.shoestore.order;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.audit.AuditLogService;
import com.webbanpc.shoestore.user.UserAccount;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;
    private final AuditLogService auditLogService;

    public AdminOrderController(OrderService orderService, AuditLogService auditLogService) {
        this.orderService = orderService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public OrderListResponse list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int pageSize) {
        return orderService.listForAdmin(status, query, page, pageSize);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse detail(@PathVariable Long id) {
        return orderService.getForAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public OrderDetailResponse updateStatus(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDetailResponse updated = orderService.updateStatus(id, request.status());
        auditLogService.record(
                actor,
                "ADMIN_ORDER_STATUS_UPDATE",
                "ORDER",
                String.valueOf(updated.id()),
                "Updated order " + updated.orderCode() + " status to " + updated.status());
        return updated;
    }
}
