package com.webbanpc.shoestore.media;

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
@RequestMapping("/api/v1/admin/media-assets")
public class AdminMediaAssetController {

    private final MediaAssetService mediaAssetService;
    private final AuditLogService auditLogService;

    public AdminMediaAssetController(MediaAssetService mediaAssetService, AuditLogService auditLogService) {
        this.mediaAssetService = mediaAssetService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<MediaAssetResponse> list() {
        return mediaAssetService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody MediaAssetRequest request) {
        MediaAssetResponse created = mediaAssetService.create(request);
        auditLogService.record(actor, "ADMIN_MEDIA_ASSET_CREATE", "MEDIA_ASSET", String.valueOf(created.id()), "Created media asset " + created.name());
        return created;
    }

    @PutMapping("/{id}")
    public MediaAssetResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody MediaAssetRequest request) {
        MediaAssetResponse updated = mediaAssetService.update(id, request);
        auditLogService.record(actor, "ADMIN_MEDIA_ASSET_UPDATE", "MEDIA_ASSET", String.valueOf(updated.id()), "Updated media asset " + updated.name());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        mediaAssetService.delete(id);
        auditLogService.record(actor, "ADMIN_MEDIA_ASSET_DELETE", "MEDIA_ASSET", String.valueOf(id), "Deleted media asset #" + id);
    }
}
