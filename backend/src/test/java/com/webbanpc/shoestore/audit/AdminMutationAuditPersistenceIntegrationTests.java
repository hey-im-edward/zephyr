package com.webbanpc.shoestore.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.webbanpc.shoestore.category.CategoryRequest;
import com.webbanpc.shoestore.category.CategoryResponse;
import com.webbanpc.shoestore.category.CategoryService;
import com.webbanpc.shoestore.order.OrderDetailResponse;
import com.webbanpc.shoestore.order.OrderItemResponse;
import com.webbanpc.shoestore.order.OrderService;
import com.webbanpc.shoestore.order.OrderStatus;
import com.webbanpc.shoestore.order.PaymentMethod;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class AdminMutationAuditPersistenceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private OrderService orderService;

    private UserAccount adminUser;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();

        adminUser = userRepository.findByEmail("admin@zephyr.vn")
                .orElseGet(() -> userRepository.saveAndFlush(UserAccount.builder()
                        .fullName("Audit Persistence Admin")
                        .email("admin@zephyr.vn")
                        .phone("0900000000")
                        .passwordHash("hashed")
                        .role(UserRole.ADMIN)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build()));
    }

    @Test
    void shouldPersistAuditLogsForCategoryCreateAndOrderStatusUpdate() throws Exception {
        String token = Long.toString(System.nanoTime(), 36);

        CategoryResponse createdCategory = new CategoryResponse(
                501L,
                "Audit Category " + token,
                "audit-category-" + token,
                "Audit category description",
                "#112233");

        when(categoryService.create(any(CategoryRequest.class))).thenReturn(createdCategory);

        OrderDetailResponse updatedOrder = sampleOrderDetailResponse(700L, "SH-" + token, OrderStatus.SHIPPING);
        when(orderService.updateStatus(700L, OrderStatus.SHIPPING)).thenReturn(updatedOrder);

        mockMvc.perform(post("/api/v1/admin/categories")
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Audit Category %s",
                                  "description": "Audit category description",
                                  "heroTone": "#112233"
                                }
                                """.formatted(token)))
                .andExpect(status().isCreated());

        mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", 700L)
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "SHIPPING"
                                }
                                """))
                .andExpect(status().isOk());

        List<AuditLog> persistedLogs = auditLogRepository.findTop100ByOrderByCreatedAtDescIdDesc();
        assertEquals(2, persistedLogs.size());

        Map<String, AuditLog> logsByAction = persistedLogs.stream()
                .collect(Collectors.toMap(AuditLog::getActionType, Function.identity(), (left, right) -> left));

        AuditLog categoryCreateLog = logsByAction.get("ADMIN_CATEGORY_CREATE");
        assertNotNull(categoryCreateLog);
        assertNotNull(categoryCreateLog.getActorUser());
        assertEquals(adminUser.getId(), categoryCreateLog.getActorUser().getId());
        assertEquals("CATEGORY", categoryCreateLog.getResourceType());
        assertEquals("501", categoryCreateLog.getResourceId());
        assertEquals("Created category " + createdCategory.slug(), categoryCreateLog.getMessage());

        AuditLog orderStatusLog = logsByAction.get("ADMIN_ORDER_STATUS_UPDATE");
        assertNotNull(orderStatusLog);
        assertNotNull(orderStatusLog.getActorUser());
        assertEquals(adminUser.getId(), orderStatusLog.getActorUser().getId());
        assertEquals("ORDER", orderStatusLog.getResourceType());
        assertEquals("700", orderStatusLog.getResourceId());
        assertEquals("Updated order SH-" + token + " status to SHIPPING", orderStatusLog.getMessage());

        assertTrue(categoryCreateLog.getCreatedAt() != null);
        assertTrue(orderStatusLog.getCreatedAt() != null);
    }

    private OrderDetailResponse sampleOrderDetailResponse(Long id, String orderCode, OrderStatus status) {
        return new OrderDetailResponse(
                id,
                orderCode,
                "Alice",
                "alice@example.com",
                "0900000000",
                "123 Test Street",
                "Ho Chi Minh City",
                "",
                status,
                PaymentMethod.COD,
                new BigDecimal("2990000"),
                "Express",
                null,
                new BigDecimal("30000"),
                BigDecimal.ZERO,
                "2-4 giờ",
                LocalDateTime.now().minusHours(2),
                LocalDateTime.now(),
                List.<OrderItemResponse>of());
    }
}
