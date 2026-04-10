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

import com.webbanpc.shoestore.adminrole.AdminRoleController;
import com.webbanpc.shoestore.adminrole.AdminRoleRequest;
import com.webbanpc.shoestore.adminrole.AdminRoleResponse;
import com.webbanpc.shoestore.adminrole.AdminRoleService;
import com.webbanpc.shoestore.banner.AdminBannerSlotController;
import com.webbanpc.shoestore.banner.BannerSlotRequest;
import com.webbanpc.shoestore.banner.BannerSlotResponse;
import com.webbanpc.shoestore.banner.BannerSlotService;
import com.webbanpc.shoestore.category.AdminCategoryController;
import com.webbanpc.shoestore.category.CategoryRequest;
import com.webbanpc.shoestore.category.CategoryResponse;
import com.webbanpc.shoestore.category.CategoryService;
import com.webbanpc.shoestore.collection.AdminCollectionController;
import com.webbanpc.shoestore.collection.CollectionRequest;
import com.webbanpc.shoestore.collection.CollectionResponse;
import com.webbanpc.shoestore.collection.CollectionService;
import com.webbanpc.shoestore.media.AdminMediaAssetController;
import com.webbanpc.shoestore.media.MediaAssetRequest;
import com.webbanpc.shoestore.media.MediaAssetResponse;
import com.webbanpc.shoestore.media.MediaAssetService;
import com.webbanpc.shoestore.review.AdminReviewController;
import com.webbanpc.shoestore.review.ReviewResponse;
import com.webbanpc.shoestore.review.ReviewService;
import com.webbanpc.shoestore.review.ReviewStatus;
import com.webbanpc.shoestore.shipping.AdminShippingMethodController;
import com.webbanpc.shoestore.shipping.ShippingMethodRequest;
import com.webbanpc.shoestore.shipping.ShippingMethodResponse;
import com.webbanpc.shoestore.shipping.ShippingMethodService;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class AdminMutationAuditLoggingCoverageTests {

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private ShippingMethodService shippingMethodService;

    @Mock
    private BannerSlotService bannerSlotService;

    @Mock
    private CollectionService collectionService;

    @Mock
    private MediaAssetService mediaAssetService;

    @Mock
    private AdminRoleService adminRoleService;

    @Mock
    private ReviewService reviewService;

    private UserAccount adminActor;

    @BeforeEach
    void setUp() {
        adminActor = UserAccount.builder()
                .id(998L)
                .fullName("Audit Coverage Admin")
                .email("audit-coverage-admin@zephyr.test")
                .phone("0900000998")
                .passwordHash("hashed")
                .role(UserRole.ADMIN)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldRecordAuditLogsForCategoryMutations() {
        AdminCategoryController controller = new AdminCategoryController(categoryService, auditLogService);
        CategoryRequest request = new CategoryRequest("Running", "Running shoes", "#112233");
        CategoryResponse created = new CategoryResponse(101L, "Running", "running", "Running shoes", "#112233");
        CategoryResponse updated = new CategoryResponse(101L, "Running Pro", "running-pro", "Updated", "#334455");
        when(categoryService.create(request)).thenReturn(created);
        when(categoryService.update(101L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 101L, request));
        controller.delete(adminActor, 101L);

        verify(auditLogService).record(adminActor, "ADMIN_CATEGORY_CREATE", "CATEGORY", "101", "Created category running");
        verify(auditLogService).record(adminActor, "ADMIN_CATEGORY_UPDATE", "CATEGORY", "101", "Updated category running-pro");
        verify(auditLogService).record(adminActor, "ADMIN_CATEGORY_DELETE", "CATEGORY", "101", "Deleted category #101");
    }

    @Test
    void shouldRecordAuditLogsForShippingMethodMutations() {
        AdminShippingMethodController controller = new AdminShippingMethodController(shippingMethodService, auditLogService);
        ShippingMethodRequest request = new ShippingMethodRequest(
                "Express",
                "Fast shipping",
                new BigDecimal("30000"),
                "2-4 hours",
                true,
                1);
        ShippingMethodResponse created = new ShippingMethodResponse(
                102L,
                "Express",
                "express",
                "Fast shipping",
                new BigDecimal("30000"),
                "2-4 hours",
                true,
                1);
        ShippingMethodResponse updated = new ShippingMethodResponse(
                102L,
                "Express Plus",
                "express-plus",
                "Faster shipping",
                new BigDecimal("40000"),
                "1-2 hours",
                true,
                1);
        when(shippingMethodService.create(request)).thenReturn(created);
        when(shippingMethodService.update(102L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 102L, request));
        controller.delete(adminActor, 102L);

        verify(auditLogService).record(adminActor, "ADMIN_SHIPPING_METHOD_CREATE", "SHIPPING_METHOD", "102", "Created shipping method express");
        verify(auditLogService).record(adminActor, "ADMIN_SHIPPING_METHOD_UPDATE", "SHIPPING_METHOD", "102", "Updated shipping method express-plus");
        verify(auditLogService).record(adminActor, "ADMIN_SHIPPING_METHOD_DELETE", "SHIPPING_METHOD", "102", "Deleted shipping method #102");
    }

    @Test
    void shouldRecordAuditLogsForBannerSlotMutations() {
        AdminBannerSlotController controller = new AdminBannerSlotController(bannerSlotService, auditLogService);
        BannerSlotRequest request = new BannerSlotRequest(
                "HOME_HERO",
                "New",
                "Hero title",
                "Hero description",
                "Shop now",
                "/catalog",
                "https://img.test/banner.png",
                "#111111",
                true,
                1);
        BannerSlotResponse created = new BannerSlotResponse(
                103L,
                "HOME_HERO",
                "New",
                "Hero title",
                "Hero description",
                "Shop now",
                "/catalog",
                "https://img.test/banner.png",
                "#111111",
                true,
                1);
        BannerSlotResponse updated = new BannerSlotResponse(
                103L,
                "HOME_HERO",
                "Updated",
                "Hero title updated",
                "Hero description updated",
                "Shop",
                "/catalog",
                "https://img.test/banner-2.png",
                "#222222",
                true,
                2);
        when(bannerSlotService.create(request)).thenReturn(created);
        when(bannerSlotService.update(103L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 103L, request));
        controller.delete(adminActor, 103L);

        verify(auditLogService).record(adminActor, "ADMIN_BANNER_SLOT_CREATE", "BANNER_SLOT", "103", "Created banner slot HOME_HERO");
        verify(auditLogService).record(adminActor, "ADMIN_BANNER_SLOT_UPDATE", "BANNER_SLOT", "103", "Updated banner slot HOME_HERO");
        verify(auditLogService).record(adminActor, "ADMIN_BANNER_SLOT_DELETE", "BANNER_SLOT", "103", "Deleted banner slot #103");
    }

    @Test
    void shouldRecordAuditLogsForCollectionMutations() {
        AdminCollectionController controller = new AdminCollectionController(collectionService, auditLogService);
        CollectionRequest request = new CollectionRequest(
                "New Drop",
                "Collection description",
                "Featured",
                "#334455",
                "https://img.test/collection.png",
                true,
                1,
                List.of(1L, 2L));
        CollectionResponse created = new CollectionResponse(
                104L,
                "New Drop",
                "new-drop",
                "Collection description",
                "Featured",
                "#334455",
                "https://img.test/collection.png",
                true,
                1,
                List.of());
        CollectionResponse updated = new CollectionResponse(
                104L,
                "New Drop Plus",
                "new-drop-plus",
                "Updated collection",
                "Featured",
                "#556677",
                "https://img.test/collection-2.png",
                true,
                2,
                List.of());
        when(collectionService.create(request)).thenReturn(created);
        when(collectionService.update(104L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 104L, request));
        controller.delete(adminActor, 104L);

        verify(auditLogService).record(adminActor, "ADMIN_COLLECTION_CREATE", "COLLECTION", "104", "Created collection new-drop");
        verify(auditLogService).record(adminActor, "ADMIN_COLLECTION_UPDATE", "COLLECTION", "104", "Updated collection new-drop-plus");
        verify(auditLogService).record(adminActor, "ADMIN_COLLECTION_DELETE", "COLLECTION", "104", "Deleted collection #104");
    }

    @Test
    void shouldRecordAuditLogsForMediaAssetMutations() {
        AdminMediaAssetController controller = new AdminMediaAssetController(mediaAssetService, auditLogService);
        MediaAssetRequest request = new MediaAssetRequest(
                "Hero Asset",
                "IMAGE",
                "https://img.test/media.png",
                "Hero asset",
                "#8899aa",
                "hero,home");
        MediaAssetResponse created = new MediaAssetResponse(
                105L,
                "Hero Asset",
                "IMAGE",
                "https://img.test/media.png",
                "Hero asset",
                "#8899aa",
                "hero,home",
                LocalDateTime.now());
        MediaAssetResponse updated = new MediaAssetResponse(
                105L,
                "Hero Asset Updated",
                "IMAGE",
                "https://img.test/media-2.png",
                "Hero asset updated",
                "#445566",
                "hero,home,updated",
                LocalDateTime.now());
        when(mediaAssetService.create(request)).thenReturn(created);
        when(mediaAssetService.update(105L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 105L, request));
        controller.delete(adminActor, 105L);

        verify(auditLogService).record(adminActor, "ADMIN_MEDIA_ASSET_CREATE", "MEDIA_ASSET", "105", "Created media asset Hero Asset");
        verify(auditLogService).record(adminActor, "ADMIN_MEDIA_ASSET_UPDATE", "MEDIA_ASSET", "105", "Updated media asset Hero Asset Updated");
        verify(auditLogService).record(adminActor, "ADMIN_MEDIA_ASSET_DELETE", "MEDIA_ASSET", "105", "Deleted media asset #105");
    }

    @Test
    void shouldRecordAuditLogsForAdminRoleMutations() {
        AdminRoleController controller = new AdminRoleController(adminRoleService, auditLogService);
        AdminRoleRequest request = new AdminRoleRequest("OPS_LEAD", "Operations Lead", "Operations role", true);
        AdminRoleResponse created = new AdminRoleResponse(106L, "OPS_LEAD", "Operations Lead", "Operations role", true);
        AdminRoleResponse updated = new AdminRoleResponse(106L, "OPS_DIRECTOR", "Operations Director", "Operations role updated", true);
        when(adminRoleService.create(request)).thenReturn(created);
        when(adminRoleService.update(106L, request)).thenReturn(updated);

        assertEquals(created, controller.create(adminActor, request));
        assertEquals(updated, controller.update(adminActor, 106L, request));
        controller.delete(adminActor, 106L);

        verify(auditLogService).record(adminActor, "ADMIN_ROLE_CREATE", "ADMIN_ROLE", "106", "Created admin role OPS_LEAD");
        verify(auditLogService).record(adminActor, "ADMIN_ROLE_UPDATE", "ADMIN_ROLE", "106", "Updated admin role OPS_DIRECTOR");
        verify(auditLogService).record(adminActor, "ADMIN_ROLE_DELETE", "ADMIN_ROLE", "106", "Deleted admin role #106");
    }

    @Test
    void shouldRecordAuditLogForReviewModerationMutation() {
        AdminReviewController controller = new AdminReviewController(reviewService, auditLogService);
        AdminReviewController.ReviewStatusRequest request = new AdminReviewController.ReviewStatusRequest("hidden");
        ReviewResponse updated = new ReviewResponse(
                107L,
                "Reviewer",
                5,
                "Great",
                "Great shoe",
                "HIDDEN",
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now());
        when(reviewService.updateStatus(107L, ReviewStatus.HIDDEN)).thenReturn(updated);

        assertEquals(updated, controller.updateStatus(adminActor, 107L, request));

        verify(auditLogService).record(
                adminActor,
                "ADMIN_REVIEW_STATUS_UPDATE",
                "REVIEW",
                "107",
                "Updated review #107 status to HIDDEN");
    }
}