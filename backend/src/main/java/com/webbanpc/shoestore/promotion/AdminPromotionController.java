package com.webbanpc.shoestore.promotion;

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
@RequestMapping("/api/v1/admin/promotions")
public class AdminPromotionController {

    private final PromotionService promotionService;
    private final AuditLogService auditLogService;

    public AdminPromotionController(PromotionService promotionService, AuditLogService auditLogService) {
        this.promotionService = promotionService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<PromotionResponse> list() {
        return promotionService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromotionResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody PromotionRequest request) {
        PromotionResponse created = promotionService.create(request);
        auditLogService.record(actor, "ADMIN_PROMOTION_CREATE", "PROMOTION", String.valueOf(created.id()), "Created promotion " + created.code());
        return created;
    }

    @PutMapping("/{id}")
    public PromotionResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        PromotionResponse updated = promotionService.update(id, request);
        auditLogService.record(actor, "ADMIN_PROMOTION_UPDATE", "PROMOTION", String.valueOf(updated.id()), "Updated promotion " + updated.code());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        promotionService.delete(id);
        auditLogService.record(actor, "ADMIN_PROMOTION_DELETE", "PROMOTION", String.valueOf(id), "Deleted promotion #" + id);
    }
}
