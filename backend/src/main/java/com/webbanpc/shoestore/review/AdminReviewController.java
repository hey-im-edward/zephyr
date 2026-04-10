package com.webbanpc.shoestore.review;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.audit.AuditLogService;
import com.webbanpc.shoestore.user.UserAccount;

import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private final ReviewService reviewService;
    private final AuditLogService auditLogService;

    public AdminReviewController(ReviewService reviewService, AuditLogService auditLogService) {
        this.reviewService = reviewService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<ReviewResponse> list() {
        return reviewService.listForAdmin();
    }

    @PatchMapping("/{id}/status")
    public ReviewResponse updateStatus(
            @AuthenticationPrincipal UserAccount actor,
            @PathVariable Long id,
            @RequestBody ReviewStatusRequest request) {
        ReviewStatus nextStatus = ReviewStatus.valueOf(request.status().trim().toUpperCase());
        ReviewResponse updated = reviewService.updateStatus(id, nextStatus);
        auditLogService.record(
                actor,
                "ADMIN_REVIEW_STATUS_UPDATE",
                "REVIEW",
                String.valueOf(updated.id()),
                "Updated review #" + updated.id() + " status to " + updated.status());
        return updated;
    }

    public record ReviewStatusRequest(@NotBlank String status) {
    }
}
