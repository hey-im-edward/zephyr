package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.category.Category;
import com.webbanpc.shoestore.category.CategoryRepository;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@SpringBootTest
@Transactional
@SuppressWarnings("null")
class CustomerOrderRepositoryReviewEligibilityTests {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShoeRepository shoeRepository;

    @Test
    void shouldReturnTrueWhenDeliveredOrderContainsShoe() {
        TestFixture fixture = createFixture("delivered");

        CustomerOrder order = order(fixture, OrderStatus.DELIVERED);
        customerOrderRepository.saveAndFlush(order);

        assertTrue(customerOrderRepository.existsDeliveredOrderContainingShoe(fixture.user().getId(), fixture.shoe().getSlug()));
    }

    @Test
    void shouldReturnFalseWhenOnlyPendingOrderContainsShoe() {
        TestFixture fixture = createFixture("pending");

        CustomerOrder order = order(fixture, OrderStatus.PENDING);
        customerOrderRepository.saveAndFlush(order);

        assertFalse(customerOrderRepository.existsDeliveredOrderContainingShoe(fixture.user().getId(), fixture.shoe().getSlug()));
    }

    private TestFixture createFixture(String suffix) {
        String token = suffix + "-" + Long.toString(System.nanoTime(), 36);

        UserAccount user = userRepository.saveAndFlush(UserAccount.builder()
                .fullName("Review Buyer " + token)
                .email("review-buyer-" + token + "@zephyr.test")
                .phone("0900000000")
                .passwordHash("ignored")
                .role(UserRole.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        Category category = categoryRepository.saveAndFlush(Category.builder()
                .name("Review Category " + token)
                .slug("review-category-" + token)
                .description("Category for review eligibility tests")
                .heroTone("#abcdef")
                .build());

        Shoe shoe = shoeRepository.saveAndFlush(Shoe.builder()
                .sku("SKU-REV-" + token)
                .name("Review Runner " + token)
                .slug("review-runner-" + token)
                .brand("ZEPHYR")
                .silhouette("running")
                .shortDescription("Eligibility test shoe")
                .description("Eligibility test shoe description")
                .price(new BigDecimal("2500000"))
                .primaryImage("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80")
                .secondaryImage("https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80")
                .availableSizes("42")
                .accentColors("black")
                .highlights("test")
                .featured(false)
                .newArrival(false)
                .bestSeller(false)
                .category(category)
                .build());

        return new TestFixture(user, shoe);
    }

    private CustomerOrder order(TestFixture fixture, OrderStatus status) {
        CustomerOrder order = CustomerOrder.builder()
                .user(fixture.user())
                .orderCode("RV-" + Long.toString(System.nanoTime(), 36).toUpperCase())
                .customerName(fixture.user().getFullName())
                .email(fixture.user().getEmail())
                .phone(fixture.user().getPhone())
                .addressLine("123 Review Street")
                .city("Ho Chi Minh City")
                .status(status)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(new BigDecimal("2500000"))
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        order.getItems().add(OrderItem.builder()
                .order(order)
                .shoeSlug(fixture.shoe().getSlug())
                .shoeName(fixture.shoe().getName())
                .sizeLabel("42")
                .price(fixture.shoe().getPrice())
                .quantity(1)
                .build());
        return order;
    }

    private record TestFixture(UserAccount user, Shoe shoe) {
    }
}
