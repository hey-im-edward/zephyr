package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.webbanpc.shoestore.category.Category;
import com.webbanpc.shoestore.category.CategoryRepository;
import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.shoe.ShoeSizeStock;
import com.webbanpc.shoestore.shoe.ShoeSizeStockRepository;

@SpringBootTest
class OrderServiceConcurrencyTests {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShoeRepository shoeRepository;

    @Autowired
    private ShoeSizeStockRepository shoeSizeStockRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Test
    @SuppressWarnings("null")
    void shouldAllowOnlyOneSuccessfulOrderWhenStockIsOne() throws Exception {
        Category category = categoryRepository.findBySlug("running").orElse(null);
        if (category == null) {
            category = Objects.requireNonNull(categoryRepository.saveAndFlush(Category.builder()
                .name("Running")
                .slug("running")
                .description("Running shoes")
                .heroTone("energetic")
                .build()));
        }

        String suffix = String.valueOf(System.nanoTime());
        String shoeSlug = "lock-test-" + suffix;

        Shoe shoe = Shoe.builder()
                .sku("SKU-" + suffix)
                .name("Lock Test Runner " + suffix)
                .slug(shoeSlug)
                .brand("ZEPHYR")
                .silhouette("running")
                .shortDescription("Concurrency test shoe")
                .description("Concurrency test shoe description")
                .price(new BigDecimal("1990000"))
                .primaryImage("https://images.unsplash.com/photo-1542291026-7eec264c27ff")
                .secondaryImage("https://images.unsplash.com/photo-1600185365483-26d7a4cc7519")
                .availableSizes("42")
                .accentColors("amber")
                .highlights("test")
                .featured(false)
                .newArrival(false)
                .bestSeller(false)
                .category(category)
                .build();
        shoe.getSizeStocks().add(ShoeSizeStock.builder()
                .shoe(shoe)
                .sizeLabel("42")
                .stockQuantity(1)
                .build());
        shoeRepository.saveAndFlush(shoe);

        OrderRequest request = new OrderRequest(
                "Concurrent Customer",
                "concurrent-" + suffix + "@zephyr.test",
                "0900000000",
                "123 Test Street",
                "Ho Chi Minh City",
                "",
                PaymentMethod.COD,
                null,
                null,
                List.of(new OrderItemRequest(shoeSlug, "42", 1)));

        long beforeOrders = customerOrderRepository.count();

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Callable<Boolean> placeOrder = () -> {
            ready.countDown();
            assertTrue(start.await(5, TimeUnit.SECONDS));
            try {
                orderService.create(null, request);
                return true;
            } catch (BadRequestException ex) {
                return false;
            }
        };

        Future<Boolean> first = executor.submit(placeOrder);
        Future<Boolean> second = executor.submit(placeOrder);

        assertTrue(ready.await(5, TimeUnit.SECONDS));
        start.countDown();

        int successCount = (first.get(10, TimeUnit.SECONDS) ? 1 : 0)
                + (second.get(10, TimeUnit.SECONDS) ? 1 : 0);

        executor.shutdown();
        assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));

        int remainingStock = shoeSizeStockRepository.findByShoeSlugAndSizeLabel(shoeSlug, "42")
                .orElseThrow()
                .getStockQuantity();

        assertEquals(1, successCount);
        assertEquals(0, remainingStock);
        assertEquals(beforeOrders + 1, customerOrderRepository.count());
    }
}
