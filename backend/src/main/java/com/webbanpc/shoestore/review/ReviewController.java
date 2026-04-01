package com.webbanpc.shoestore.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.user.UserAccount;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/shoes/{slug}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<ReviewResponse> list(@PathVariable String slug) {
        return reviewService.listPublishedForShoe(slug);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse upsert(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable String slug,
            @Valid @RequestBody ReviewRequest request) {
        return reviewService.upsert(user, slug, request);
    }
}
