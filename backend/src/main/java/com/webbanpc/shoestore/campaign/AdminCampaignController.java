package com.webbanpc.shoestore.campaign;

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
@RequestMapping("/api/v1/admin/campaigns")
public class AdminCampaignController {

    private final CampaignService campaignService;
    private final AuditLogService auditLogService;

    public AdminCampaignController(CampaignService campaignService, AuditLogService auditLogService) {
        this.campaignService = campaignService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<CampaignResponse> list() {
        return campaignService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse create(
            @AuthenticationPrincipal UserAccount actor,
            @Valid @RequestBody CampaignRequest request) {
        CampaignResponse created = campaignService.create(request);
        auditLogService.record(actor, "ADMIN_CAMPAIGN_CREATE", "CAMPAIGN", String.valueOf(created.id()), "Created campaign " + created.slug());
        return created;
    }

    @PutMapping("/{id}")
    public CampaignResponse update(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        CampaignResponse updated = campaignService.update(id, request);
        auditLogService.record(actor, "ADMIN_CAMPAIGN_UPDATE", "CAMPAIGN", String.valueOf(updated.id()), "Updated campaign " + updated.slug());
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id) {
        campaignService.delete(id);
        auditLogService.record(actor, "ADMIN_CAMPAIGN_DELETE", "CAMPAIGN", String.valueOf(id), "Deleted campaign #" + id);
    }
}
