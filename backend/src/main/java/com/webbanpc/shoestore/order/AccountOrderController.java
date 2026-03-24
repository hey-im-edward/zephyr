package com.webbanpc.shoestore.order;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<OrderResponse> list(@AuthenticationPrincipal UserAccount user) {
        return orderService.listForUser(user);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse detail(@AuthenticationPrincipal UserAccount user, @PathVariable Long id) {
        return orderService.getForUser(user, id);
    }
}
