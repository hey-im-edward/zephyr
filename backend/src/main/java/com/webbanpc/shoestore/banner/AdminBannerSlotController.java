package com.webbanpc.shoestore.banner;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.audit.AuditLogService;
import com.webbanpc.shoestore.user.UserAccount;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/banner-slots")
public class AdminBannerSlotController {

    private final BannerSlotService bannerSlotService;
    private final AuditLogService auditLogService;

    public AdminBannerSlotController(BannerSlotService bannerSlotService, AuditLogService auditLogService) {
        this.bannerSlotService = bannerSlotService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<BannerSlotResponse> list() {
        return bannerSlotService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BannerSlotResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody BannerSlotRequest request) {
        BannerSlotResponse created = bannerSlotService.create(request);
        auditLogService.record(
                actor,
                "ADMIN_BANNER_SLOT_CREATE",
                "BANNER_SLOT",
                String.valueOf(created.id()),
                "Created banner slot " + created.slotKey());
        return created;
    }

    @PutMapping("/{id}")
    public BannerSlotResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody BannerSlotRequest request) {
        BannerSlotResponse updated = bannerSlotService.update(id, request);
        auditLogService.record(
                actor,
                "ADMIN_BANNER_SLOT_UPDATE",
                "BANNER_SLOT",
                String.valueOf(updated.id()),
                "Updated banner slot " + updated.slotKey());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        bannerSlotService.delete(id);
        auditLogService.record(actor, "ADMIN_BANNER_SLOT_DELETE", "BANNER_SLOT", String.valueOf(id), "Deleted banner slot #" + id);
    }
}
