package com.webbanpc.shoestore.shipping;

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
@RequestMapping("/api/v1/admin/shipping-methods")
public class AdminShippingMethodController {

    private final ShippingMethodService shippingMethodService;
    private final AuditLogService auditLogService;

    public AdminShippingMethodController(ShippingMethodService shippingMethodService, AuditLogService auditLogService) {
        this.shippingMethodService = shippingMethodService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<ShippingMethodResponse> list() {
        return shippingMethodService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShippingMethodResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody ShippingMethodRequest request) {
        ShippingMethodResponse created = shippingMethodService.create(request);
        auditLogService.record(
                actor,
                "ADMIN_SHIPPING_METHOD_CREATE",
                "SHIPPING_METHOD",
                String.valueOf(created.id()),
                "Created shipping method " + created.slug());
        return created;
    }

    @PutMapping("/{id}")
    public ShippingMethodResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody ShippingMethodRequest request) {
        ShippingMethodResponse updated = shippingMethodService.update(id, request);
        auditLogService.record(
                actor,
                "ADMIN_SHIPPING_METHOD_UPDATE",
                "SHIPPING_METHOD",
                String.valueOf(updated.id()),
                "Updated shipping method " + updated.slug());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        shippingMethodService.delete(id);
        auditLogService.record(actor, "ADMIN_SHIPPING_METHOD_DELETE", "SHIPPING_METHOD", String.valueOf(id), "Deleted shipping method #" + id);
    }
}
