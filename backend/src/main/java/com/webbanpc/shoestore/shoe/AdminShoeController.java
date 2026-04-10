package com.webbanpc.shoestore.shoe;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.audit.AuditLogService;
import com.webbanpc.shoestore.user.UserAccount;

@RestController
@RequestMapping("/api/v1/admin/shoes")
public class AdminShoeController {

    private final ShoeService shoeService;
    private final AuditLogService auditLogService;

    public AdminShoeController(ShoeService shoeService, AuditLogService auditLogService) {
        this.shoeService = shoeService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<ShoeDetailResponse> list() {
        return shoeService.getAllForAdmin();
    }

    @GetMapping("/{id}")
    public ShoeDetailResponse get(@PathVariable @NonNull Long id) {
        return shoeService.getById(Objects.requireNonNull(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoeDetailResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody ShoeRequest request) {
        ShoeDetailResponse created = shoeService.create(request);
        auditLogService.record(actor, "ADMIN_SHOE_CREATE", "SHOE", String.valueOf(created.id()), "Created shoe " + created.slug());
        return created;
    }

    @PutMapping("/{id}")
    public ShoeDetailResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable @NonNull Long id,
            @Valid @RequestBody ShoeRequest request) {
        ShoeDetailResponse updated = shoeService.update(Objects.requireNonNull(id), request);
        auditLogService.record(actor, "ADMIN_SHOE_UPDATE", "SHOE", String.valueOf(updated.id()), "Updated shoe " + updated.slug());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable @NonNull Long id) {
        shoeService.delete(Objects.requireNonNull(id));
        auditLogService.record(actor, "ADMIN_SHOE_DELETE", "SHOE", String.valueOf(id), "Deleted shoe #" + id);
    }
}
