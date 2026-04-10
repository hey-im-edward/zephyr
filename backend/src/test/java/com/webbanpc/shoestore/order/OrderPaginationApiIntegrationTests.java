package com.webbanpc.shoestore.order;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@SuppressWarnings("null")
class OrderPaginationApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    private UserAccount accountUser;
    private UserAccount adminUser;
    private String datasetToken;
    private String newestOrderCode;
    private String secondNewestOrderCode;
    private String newestPendingOrderCode;

    @BeforeEach
    void setUp() {
        datasetToken = Long.toString(System.nanoTime(), 36);
        LocalDateTime now = LocalDateTime.now();

        accountUser = userRepository.saveAndFlush(UserAccount.builder()
                .fullName("Pagination Account User")
                .email("pagination-account-" + datasetToken + "@zephyr.test")
                .phone("0901000000")
                .passwordHash("hashed")
                .role(UserRole.USER)
                .active(true)
                .createdAt(now)
                .build());

        adminUser = userRepository.saveAndFlush(UserAccount.builder()
                .fullName("Pagination Admin User")
                .email("pagination-admin-" + datasetToken + "@zephyr.test")
                .phone("0902000000")
                .passwordHash("hashed")
                .role(UserRole.ADMIN)
                .active(true)
                .createdAt(now)
                .build());

        saveOrder(accountUser, "SH-" + datasetToken + "-01", OrderStatus.PENDING, now.minusHours(5));
        saveOrder(accountUser, "SH-" + datasetToken + "-02", OrderStatus.CONFIRMED, now.minusHours(4));
        saveOrder(accountUser, "SH-" + datasetToken + "-03", OrderStatus.PENDING, now.minusHours(3));
        CustomerOrder secondNewest = saveOrder(accountUser, "SH-" + datasetToken + "-04", OrderStatus.DELIVERED, now.minusHours(2));
        CustomerOrder newest = saveOrder(accountUser, "SH-" + datasetToken + "-05", OrderStatus.PENDING, now.minusHours(1));

        newestOrderCode = newest.getOrderCode();
        secondNewestOrderCode = secondNewest.getOrderCode();
        newestPendingOrderCode = newest.getOrderCode();
    }

    @Test
    void shouldReturnPaginatedAccountOrdersWithStableMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/account/orders")
                        .with(user(accountUser))
                        .param("page", "1")
                        .param("pageSize", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.pagination.page").value(1))
                .andExpect(jsonPath("$.pagination.pageSize").value(2))
                .andExpect(jsonPath("$.pagination.totalItems").value(5))
                .andExpect(jsonPath("$.pagination.totalPages").value(3))
                .andExpect(jsonPath("$.items[0].orderCode").value(newestOrderCode))
                .andExpect(jsonPath("$.items[1].orderCode").value(secondNewestOrderCode));
    }

    @Test
    void shouldReturnPaginatedAdminOrdersWithStatusAndQueryFilters() throws Exception {
        mockMvc.perform(get("/api/v1/admin/orders")
                        .with(user(adminUser))
                        .param("status", "PENDING")
                        .param("query", datasetToken)
                        .param("page", "1")
                        .param("pageSize", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.pagination.page").value(1))
                .andExpect(jsonPath("$.pagination.pageSize").value(1))
                .andExpect(jsonPath("$.pagination.totalItems").value(3))
                .andExpect(jsonPath("$.pagination.totalPages").value(3))
                .andExpect(jsonPath("$.items[0].orderCode").value(newestPendingOrderCode))
                .andExpect(jsonPath("$.items[0].status").value("PENDING"));
    }

    private CustomerOrder saveOrder(UserAccount user, String orderCode, OrderStatus status, LocalDateTime createdAt) {
        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .orderCode(orderCode)
                .customerName("Pagination Customer " + datasetToken)
                .email("order-" + orderCode.toLowerCase() + "@zephyr.test")
                .phone("0900000000")
                .addressLine("123 Pagination Street")
                .city("Ho Chi Minh City")
                .status(status)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(new BigDecimal("2500000"))
                .shippingFee(new BigDecimal("30000"))
                .discountAmount(BigDecimal.ZERO)
                .deliveryWindow("2-4 hours")
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();

        return customerOrderRepository.saveAndFlush(order);
    }
}