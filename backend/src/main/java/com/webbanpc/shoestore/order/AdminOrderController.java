package com.webbanpc.shoestore.order;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String query) {
        return orderService.listForAdmin(status, query);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse detail(@PathVariable Long id) {
        return orderService.getForAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public OrderDetailResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.status());
    }
}
