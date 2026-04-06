package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@SpringBootTest
@SuppressWarnings("null")
class CustomerOrderRepositoryAdminSearchTests {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFilterAndSortOrdersInDatabaseForAdminSearch() {
        String token = Long.toString(System.nanoTime(), 36);

        UserAccount user = userRepository.saveAndFlush(UserAccount.builder()
                .fullName("Admin Search Buyer")
                .email("admin-search-buyer-" + token + "@zephyr.test")
                .phone("0900000000")
                .passwordHash("ignored")
                .role(UserRole.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        CustomerOrder olderPending = saveOrder(user, "SH-" + token + "-A", "Alice Runner " + token, "alice-old-" + token + "@zephyr.test", OrderStatus.PENDING,
                LocalDateTime.now().minusDays(2));
        CustomerOrder newerPending = saveOrder(user, "SH-" + token + "-B", "Alice Street " + token, "alice-new-" + token + "@zephyr.test", OrderStatus.PENDING,
                LocalDateTime.now().minusHours(2));
        CustomerOrder deliveredMatch = saveOrder(user, "SH-" + token + "-C", "Alice Delivered " + token, "alice-delivered-" + token + "@zephyr.test", OrderStatus.DELIVERED,
                LocalDateTime.now().minusHours(1));

        List<CustomerOrder> allOrders = customerOrderRepository.findAllForAdmin(null, token);
        assertEquals(List.of(deliveredMatch.getId(), newerPending.getId(), olderPending.getId()),
                allOrders.stream().map(CustomerOrder::getId).toList());

        List<CustomerOrder> filteredOrders = customerOrderRepository.findAllForAdmin(OrderStatus.PENDING, token);
        assertEquals(List.of(newerPending.getId(), olderPending.getId()),
                filteredOrders.stream().map(CustomerOrder::getId).toList());
    }

    @Test
    void shouldUseIdAsStableTieBreakerWhenCreatedAtMatches() {
        String token = Long.toString(System.nanoTime(), 36);

        UserAccount user = userRepository.saveAndFlush(UserAccount.builder()
                .fullName("Admin Search Tie Breaker")
                .email("admin-search-tie-breaker-" + token + "@zephyr.test")
                .phone("0900000001")
                .passwordHash("ignored")
                .role(UserRole.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        LocalDateTime sameCreatedAt = LocalDateTime.now().minusMinutes(30);
        CustomerOrder firstSaved = saveOrder(user, "SH-TIE-" + token + "-1", "Tie Breaker One " + token, "tie-one-" + token + "@zephyr.test", OrderStatus.CONFIRMED,
                sameCreatedAt);
        CustomerOrder secondSaved = saveOrder(user, "SH-TIE-" + token + "-2", "Tie Breaker Two " + token, "tie-two-" + token + "@zephyr.test", OrderStatus.CONFIRMED,
                sameCreatedAt);

        List<CustomerOrder> filteredOrders = customerOrderRepository.findAllForAdmin(OrderStatus.CONFIRMED, token);
        assertEquals(List.of(secondSaved.getId(), firstSaved.getId()),
                filteredOrders.stream().map(CustomerOrder::getId).toList());
    }

    private CustomerOrder saveOrder(UserAccount user, String orderCode, String customerName, String email, OrderStatus status,
            LocalDateTime createdAt) {
        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .orderCode(orderCode)
                .customerName(customerName)
                .email(email)
                .phone("0900000000")
                .addressLine("123 Admin Search Street")
                .city("Ho Chi Minh City")
                .status(status)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(new BigDecimal("2500000"))
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();

        return customerOrderRepository.saveAndFlush(order);
    }
}
