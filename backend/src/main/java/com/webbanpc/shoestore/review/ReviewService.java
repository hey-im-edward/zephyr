package com.webbanpc.shoestore.review;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserAccount;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ShoeRepository shoeRepository;

    public ReviewService(ReviewRepository reviewRepository, ShoeRepository shoeRepository) {
        this.reviewRepository = reviewRepository;
        this.shoeRepository = shoeRepository;
    }

    public List<ReviewResponse> listPublishedForShoe(String slug) {
        return reviewRepository.findAllByShoeSlugAndStatusOrderByCreatedAtDesc(slug, ReviewStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReviewResponse> listForAdmin() {
        return reviewRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public double averageRating(Long shoeId) {
        return reviewRepository.averageRatingByShoeId(shoeId);
    }

    public long reviewCount(Long shoeId) {
        return reviewRepository.countByShoeIdAndStatus(shoeId, ReviewStatus.PUBLISHED);
    }

    @Transactional
    public ReviewResponse upsert(UserAccount user, String slug, ReviewRequest request) {
        Shoe shoe = shoeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + slug));

        Review review = reviewRepository.findByUserIdAndShoeSlug(user.getId(), slug)
                .orElseGet(() -> Review.builder()
                        .user(user)
                        .shoe(shoe)
                        .createdAt(LocalDateTime.now())
                        .build());

        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setBody(request.body());
        review.setStatus(ReviewStatus.PUBLISHED);
        review.setUpdatedAt(LocalDateTime.now());

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateStatus(@NonNull Long id, ReviewStatus status) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));
        review.setStatus(status);
        review.setUpdatedAt(LocalDateTime.now());
        return toResponse(review);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getFullName(),
                review.getRating(),
                review.getTitle(),
                review.getBody(),
                review.getStatus().name(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
