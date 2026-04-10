package com.webbanpc.shoestore.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.webbanpc.shoestore.campaign.AdminCampaignController;
import com.webbanpc.shoestore.campaign.CampaignRequest;
import com.webbanpc.shoestore.campaign.CampaignResponse;
import com.webbanpc.shoestore.campaign.CampaignService;
import com.webbanpc.shoestore.order.AdminOrderController;
import com.webbanpc.shoestore.order.OrderDetailResponse;
import com.webbanpc.shoestore.order.OrderItemResponse;
import com.webbanpc.shoestore.order.OrderService;
import com.webbanpc.shoestore.order.OrderStatus;
import com.webbanpc.shoestore.order.PaymentMethod;
import com.webbanpc.shoestore.order.UpdateOrderStatusRequest;
import com.webbanpc.shoestore.promotion.AdminPromotionController;
import com.webbanpc.shoestore.promotion.PromotionRequest;
import com.webbanpc.shoestore.promotion.PromotionResponse;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.shoe.AdminShoeController;
import com.webbanpc.shoestore.shoe.ShoeDetailResponse;
import com.webbanpc.shoestore.shoe.ShoeRequest;
import com.webbanpc.shoestore.shoe.ShoeService;
import com.webbanpc.shoestore.shoe.SizeStockRequest;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class AdminMutationAuditLoggingControllerTests {

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private ShoeService shoeService;

    @Mock
    private PromotionService promotionService;

    @Mock
    private CampaignService campaignService;

    @Mock
    private OrderService orderService;

    private UserAccount adminActor;

    @BeforeEach
    void setUp() {
        adminActor = UserAccount.builder()
                .id(999L)
                .fullName("Admin Auditor")
                .email("admin-auditor@zephyr.test")
                .phone("0900000999")
                .passwordHash("hashed")
                .role(UserRole.ADMIN)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldRecordAuditLogWhenAdminCreatesShoe() {
        AdminShoeController controller = new AdminShoeController(shoeService, auditLogService);
        ShoeRequest request = new ShoeRequest(
                "SKU-001",
                "Runner Pro",
                "Zephyr",
                "Performance",
                "Short",
                "Long description",
                new BigDecimal("2490000"),
                "https://img.test/1.png",
                "https://img.test/2.png",
                List.of(new SizeStockRequest("42", 5)),
                "#111111|#222222",
                "Lightweight|Stable",
                true,
                false,
                false,
                "running");

        ShoeDetailResponse created = sampleShoeDetailResponse(15L, "runner-pro");
        when(shoeService.create(request)).thenReturn(created);

        ShoeDetailResponse response = controller.create(adminActor, request);

        assertEquals(created, response);
        verify(auditLogService).record(adminActor, "ADMIN_SHOE_CREATE", "SHOE", "15", "Created shoe runner-pro");
    }

    @Test
    void shouldRecordAuditLogWhenAdminUpdatesPromotion() {
        AdminPromotionController controller = new AdminPromotionController(promotionService, auditLogService);
        PromotionRequest request = new PromotionRequest(
                "APRIL10",
                "April Discount",
                "Campaign discount",
                "Save 10%",
                "-10%",
                "#f5a623",
                true,
                false);

        PromotionResponse updated = new PromotionResponse(23L, "APRIL10", "April Discount", "Campaign discount", "Save 10%", "-10%", "#f5a623", true,
                false);
        when(promotionService.update(23L, request)).thenReturn(updated);

        PromotionResponse response = controller.update(adminActor, 23L, request);

        assertEquals(updated, response);
        verify(auditLogService).record(adminActor, "ADMIN_PROMOTION_UPDATE", "PROMOTION", "23", "Updated promotion APRIL10");
    }

    @Test
    void shouldRecordAuditLogWhenAdminDeletesCampaign() {
        AdminCampaignController controller = new AdminCampaignController(campaignService, auditLogService);

        controller.delete(adminActor, 44L);

        verify(campaignService).delete(44L);
        verify(auditLogService).record(adminActor, "ADMIN_CAMPAIGN_DELETE", "CAMPAIGN", "44", "Deleted campaign #44");
    }

    @Test
    void shouldRecordAuditLogWhenAdminUpdatesOrderStatus() {
        AdminOrderController controller = new AdminOrderController(orderService, auditLogService);
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest(OrderStatus.SHIPPING);
        OrderDetailResponse updated = sampleOrderDetailResponse(31L, "SH-20260409-0001", OrderStatus.SHIPPING);
        when(orderService.updateStatus(31L, OrderStatus.SHIPPING)).thenReturn(updated);

        OrderDetailResponse response = controller.updateStatus(adminActor, 31L, request);

        assertEquals(updated, response);
        verify(auditLogService).record(
                adminActor,
                "ADMIN_ORDER_STATUS_UPDATE",
                "ORDER",
                "31",
                "Updated order SH-20260409-0001 status to SHIPPING");
    }

    private ShoeDetailResponse sampleShoeDetailResponse(Long id, String slug) {
        return new ShoeDetailResponse(
                id,
                "SKU-001",
                "Runner Pro",
                slug,
                "Zephyr",
                "Performance",
                "Short",
                "Long description",
                new BigDecimal("2490000"),
                "https://img.test/1.png",
                "https://img.test/2.png",
                List.of(),
                null,
                List.of("42"),
                List.of(),
                List.of("#111111"),
                List.of("Lightweight"),
                null,
                null,
                "Top Pick",
                "running",
                "Running",
                true,
                false,
                false,
                5,
                true,
                4.8,
                12L);
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