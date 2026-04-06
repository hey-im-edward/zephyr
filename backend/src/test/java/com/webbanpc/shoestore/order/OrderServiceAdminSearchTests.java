package com.webbanpc.shoestore.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                customerOrderRepository,
                shoeRepository,
                shoeSizeStockRepository,
                shippingMethodService,
                promotionService,
                orderStatusHistoryRepository);
    }

    @Test
    void shouldTrimAdminQueryBeforeDelegatingToRepository() {
        when(customerOrderRepository.findAllForAdmin(OrderStatus.PENDING, "alice")).thenReturn(List.of());

        orderService.listForAdmin(OrderStatus.PENDING, "  alice  ");

        verify(customerOrderRepository).findAllForAdmin(OrderStatus.PENDING, "alice");
    }

    @Test
    void shouldTreatBlankAdminQueryAsNullBeforeDelegatingToRepository() {
        when(customerOrderRepository.findAllForAdmin(null, null)).thenReturn(List.of());

        List<OrderResponse> responses = orderService.listForAdmin(null, "   ");

        verify(customerOrderRepository).findAllForAdmin(null, null);
        assertEquals(List.of(), responses);
    }
}
