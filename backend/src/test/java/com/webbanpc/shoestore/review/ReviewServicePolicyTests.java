package com.webbanpc.shoestore.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class ReviewServicePolicyTests {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ShoeRepository shoeRepository;

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, shoeRepository, customerOrderRepository);
    }

    @Test
    void shouldRejectAdminWhenSubmittingReview() {
        UserAccount admin = account(1L, UserRole.ADMIN);

        assertThrows(
                AccessDeniedException.class,
                () -> reviewService.upsert(admin, "zephyr-runner", reviewRequest()));

        verifyNoInteractions(reviewRepository, shoeRepository, customerOrderRepository);
    }

    @Test
    void shouldRejectUserWithoutDeliveredPurchase() {
        UserAccount customer = account(2L, UserRole.USER);
        Shoe shoe = shoe("zephyr-runner");

        when(shoeRepository.findBySlug("zephyr-runner")).thenReturn(Optional.of(shoe));
        when(customerOrderRepository.existsDeliveredOrderContainingShoe(2L, "zephyr-runner")).thenReturn(false);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> reviewService.upsert(customer, "zephyr-runner", reviewRequest()));

        verify(shoeRepository).findBySlug("zephyr-runner");
        verify(customerOrderRepository).existsDeliveredOrderContainingShoe(2L, "zephyr-runner");
        verify(reviewRepository, never()).save(any());
        assertEquals("Chỉ người mua đã nhận hàng mới có thể gửi đánh giá.", exception.getMessage());
    }

    @Test
    void shouldPersistNewReviewAsPendingForDeliveredCustomer() {
        UserAccount customer = account(3L, UserRole.USER);
        Shoe shoe = shoe("zephyr-runner");

        when(shoeRepository.findBySlug("zephyr-runner")).thenReturn(Optional.of(shoe));
        when(customerOrderRepository.existsDeliveredOrderContainingShoe(3L, "zephyr-runner")).thenReturn(true);
        when(reviewRepository.findByUserIdAndShoeSlug(3L, "zephyr-runner")).thenReturn(Optional.empty());
        when(reviewRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = reviewService.upsert(customer, "zephyr-runner", reviewRequest());

        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());

        Review saved = reviewCaptor.getValue();
        assertEquals(ReviewStatus.PENDING, saved.getStatus());
        assertEquals(5, saved.getRating());
        assertEquals("Great fit", saved.getTitle());
        assertEquals("Comfortable all day.", saved.getBody());
        assertEquals(ReviewStatus.PENDING.name(), response.status());
        assertEquals(customer.getFullName(), response.customerName());
    }

    @Test
    void shouldResetExistingReviewToPendingWhenEdited() {
        UserAccount customer = account(4L, UserRole.USER);
        Shoe shoe = shoe("zephyr-runner");
        Review existingReview = Review.builder()
                .id(10L)
                .user(customer)
                .shoe(shoe)
                .rating(4)
                .title("Old title")
                .body("Old body")
                .status(ReviewStatus.PUBLISHED)
                .createdAt(LocalDateTime.now().minusDays(2))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        when(shoeRepository.findBySlug("zephyr-runner")).thenReturn(Optional.of(shoe));
        when(customerOrderRepository.existsDeliveredOrderContainingShoe(4L, "zephyr-runner")).thenReturn(true);
        when(reviewRepository.findByUserIdAndShoeSlug(4L, "zephyr-runner")).thenReturn(Optional.of(existingReview));
        when(reviewRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        reviewService.upsert(customer, "zephyr-runner", reviewRequest());

        verify(reviewRepository).save(existingReview);
        assertEquals(ReviewStatus.PENDING, existingReview.getStatus());
        assertEquals(5, existingReview.getRating());
        assertEquals("Great fit", existingReview.getTitle());
        assertEquals("Comfortable all day.", existingReview.getBody());
    }

    private ReviewRequest reviewRequest() {
        return new ReviewRequest(5, "Great fit", "Comfortable all day.");
    }

    private UserAccount account(Long id, UserRole role) {
        return UserAccount.builder()
                .id(id)
                .fullName("Customer " + id)
                .email("customer" + id + "@zephyr.test")
                .phone("0900000000")
                .passwordHash("ignored")
                .role(role)
                .active(true)
                .build();
    }

    private Shoe shoe(String slug) {
        return Shoe.builder()
                .id(99L)
                .sku("SKU-" + slug)
                .name("Zephyr Runner")
                .slug(slug)
                .brand("ZEPHYR")
                .silhouette("running")
                .shortDescription("Test shoe")
                .description("Test shoe description")
                .price(new BigDecimal("2500000"))
                .primaryImage("https://example.com/primary.jpg")
                .secondaryImage("https://example.com/secondary.jpg")
                .availableSizes("42")
                .accentColors("black")
                .highlights("test")
                .featured(false)
                .newArrival(false)
                .bestSeller(false)
                .build();
    }
}
