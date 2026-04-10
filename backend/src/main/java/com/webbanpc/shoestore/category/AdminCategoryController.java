package com.webbanpc.shoestore.category;

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
@RequestMapping("/api/v1/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final AuditLogService auditLogService;

    public AdminCategoryController(CategoryService categoryService, AuditLogService auditLogService) {
        this.categoryService = categoryService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return categoryService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = categoryService.create(request);
        auditLogService.record(actor, "ADMIN_CATEGORY_CREATE", "CATEGORY", String.valueOf(created.id()), "Created category " + created.slug());
        return created;
    }

    @PutMapping("/{id}")
    public CategoryResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable @NonNull Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse updated = categoryService.update(Objects.requireNonNull(id), request);
        auditLogService.record(actor, "ADMIN_CATEGORY_UPDATE", "CATEGORY", String.valueOf(updated.id()), "Updated category " + updated.slug());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable @NonNull Long id) {
        categoryService.delete(Objects.requireNonNull(id));
        auditLogService.record(actor, "ADMIN_CATEGORY_DELETE", "CATEGORY", String.valueOf(id), "Deleted category #" + id);
    }
}
