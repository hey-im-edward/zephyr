package com.webbanpc.shoestore.order;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.user.UserAccount;

@RestController
@RequestMapping("/api/v1/account/orders")
public class AccountOrderController {

    private final OrderService orderService;

    public AccountOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public OrderListResponse list(
            @AuthenticationPrincipal UserAccount user,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {
        return orderService.listForUser(user, page, pageSize);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse detail(@AuthenticationPrincipal UserAccount user, @PathVariable Long id) {
        return orderService.getForUser(user, id);
    }
}
