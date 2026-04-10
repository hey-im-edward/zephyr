package com.webbanpc.shoestore.collection;

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
@RequestMapping("/api/v1/admin/collections")
public class AdminCollectionController {

    private final CollectionService collectionService;
    private final AuditLogService auditLogService;

    public AdminCollectionController(CollectionService collectionService, AuditLogService auditLogService) {
        this.collectionService = collectionService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<CollectionResponse> list() {
        return collectionService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CollectionResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody CollectionRequest request) {
        CollectionResponse created = collectionService.create(request);
        auditLogService.record(actor, "ADMIN_COLLECTION_CREATE", "COLLECTION", String.valueOf(created.id()), "Created collection " + created.slug());
        return created;
    }

    @PutMapping("/{id}")
    public CollectionResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody CollectionRequest request) {
        CollectionResponse updated = collectionService.update(id, request);
        auditLogService.record(actor, "ADMIN_COLLECTION_UPDATE", "COLLECTION", String.valueOf(updated.id()), "Updated collection " + updated.slug());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        collectionService.delete(id);
        auditLogService.record(actor, "ADMIN_COLLECTION_DELETE", "COLLECTION", String.valueOf(id), "Deleted collection #" + id);
    }
}
