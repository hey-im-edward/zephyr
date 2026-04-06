package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;

import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@SpringBootTest
class OrderServiceAuthorizationTests {

    @Autowired
    private OrderService orderService;

    @Test
    void shouldRejectAdminAccountWhenCreatingOrder() {
        UserAccount admin = UserAccount.builder()
                .id(999L)
                .fullName("Admin User")
                .email("admin@zephyr.vn")
                .phone("0900000000")
                .passwordHash("ignored")
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        OrderRequest request = new OrderRequest(
                "Admin User",
                "admin@zephyr.vn",
                "0900000000",
                "123 Admin Street",
                "Ho Chi Minh City",
                null,
                PaymentMethod.COD,
                null,
                null,
                List.of());

        assertThrows(AccessDeniedException.class, () -> orderService.create(admin, request));
    }
}
