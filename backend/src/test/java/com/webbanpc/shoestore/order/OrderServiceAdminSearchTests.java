package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.webbanpc.shoestore.payment.PaymentService;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.shipping.ShippingMethodService;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.shoe.ShoeSizeStockRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceAdminSearchTests {

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private ShoeRepository shoeRepository;

    @Mock
    private ShoeSizeStockRepository shoeSizeStockRepository;

    @Mock
    private ShippingMethodService shippingMethodService;

    @Mock
    private PromotionService promotionService;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private PaymentService paymentService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                customerOrderRepository,
                shoeRepository,
                shoeSizeStockRepository,
                shippingMethodService,
                promotionService,
                orderStatusHistoryRepository,
                paymentService);
    }

    @Test
    void shouldTrimAdminQueryBeforeDelegatingToRepository() {
        when(customerOrderRepository.findAllForAdmin(eq(OrderStatus.PENDING), eq("alice"), any(Pageable.class)))
                .thenReturn(Page.empty());

        orderService.listForAdmin(OrderStatus.PENDING, "  alice  ", 2, 15);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(customerOrderRepository).findAllForAdmin(eq(OrderStatus.PENDING), eq("alice"), pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertEquals(1, pageable.getPageNumber());
        assertEquals(15, pageable.getPageSize());
    }

    @Test
    void shouldTreatBlankAdminQueryAsNullBeforeDelegatingToRepository() {
        when(customerOrderRepository.findAllForAdmin(eq(null), eq(null), any(Pageable.class))).thenReturn(Page.empty());

        OrderListResponse response = orderService.listForAdmin(null, "   ", 0, 999);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(customerOrderRepository).findAllForAdmin(eq(null), eq(null), pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertEquals(0, pageable.getPageNumber());
        assertEquals(50, pageable.getPageSize());
        assertEquals(1, response.pagination().page());
        assertEquals(50, response.pagination().pageSize());
        assertEquals(0, response.items().size());
    }
}
