package com.webbanpc.shoestore.review;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<ReviewResponse> list() {
        return reviewService.listForAdmin();
    }

    @PatchMapping("/{id}/status")
    public ReviewResponse updateStatus(@PathVariable Long id, @RequestBody ReviewStatusRequest request) {
        return reviewService.updateStatus(id, ReviewStatus.valueOf(request.status().trim().toUpperCase()));
    }

    public record ReviewStatusRequest(@NotBlank String status) {
    }
}
