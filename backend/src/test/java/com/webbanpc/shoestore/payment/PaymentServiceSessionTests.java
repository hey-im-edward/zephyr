package com.webbanpc.shoestore.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.order.CustomerOrder;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.order.PaymentMethod;

@ExtendWith(MockitoExtension.class)
class PaymentServiceSessionTests {

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private PaymentOnlineProperties paymentOnlineProperties;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                customerOrderRepository,
                paymentTransactionRepository,
                paymentOnlineProperties);
    }

    @Test
    void shouldCreateCardPaymentSessionForOnlineOrder() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);

        when(paymentOnlineProperties.enabled()).thenReturn(true);
        when(paymentOnlineProperties.sessionExpiryMinutes()).thenReturn(15);
        when(paymentOnlineProperties.mockCheckoutBaseUrl()).thenReturn("http://localhost:3000/checkout");
        when(customerOrderRepository.findByOrderCode(eq(order.getOrderCode()))).thenReturn(Optional.of(order));
        when(paymentTransactionRepository.findByOrderId(eq(order.getId()))).thenReturn(Optional.empty());
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.createOrRefreshSession(order.getOrderCode());

        assertEquals(PaymentMethod.CARD, response.method());
        assertEquals(PaymentProvider.MOCK, response.provider());
        assertEquals(PaymentChannel.CARD, response.channel());
        assertEquals(PaymentStatus.PENDING_ACTION, response.status());
        assertEquals(order.getTotalAmount(), response.amount());
        assertNotNull(response.referenceToken());
        assertTrue(response.canConfirmMock());
        assertNotNull(response.checkoutUrl());
        assertTrue(response.checkoutUrl().contains("paymentMock=true"));
        verify(paymentTransactionRepository).saveAndFlush(any(PaymentTransaction.class));
    }

    @Test
    void shouldRejectBankQrSessionWhenVietQrConfigMissing() {
        CustomerOrder order = buildOrder(PaymentMethod.BANK_QR);

        when(paymentOnlineProperties.enabled()).thenReturn(true);
        when(paymentOnlineProperties.sessionExpiryMinutes()).thenReturn(15);
        when(paymentOnlineProperties.vietQrBankCode()).thenReturn(null);
        when(paymentOnlineProperties.vietQrAccountNumber()).thenReturn(null);
        when(paymentOnlineProperties.vietQrAccountName()).thenReturn(null);
        when(customerOrderRepository.findByOrderCode(eq(order.getOrderCode()))).thenReturn(Optional.of(order));
        when(paymentTransactionRepository.findByOrderId(eq(order.getId()))).thenReturn(Optional.empty());

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> paymentService.createOrRefreshSession(order.getOrderCode()));

        assertTrue(exception.getMessage().contains("BANK_QR is not configured"));
        verify(paymentTransactionRepository, never()).saveAndFlush(any(PaymentTransaction.class));
    }

    @Test
    void shouldConfirmMockPaymentAndMarkTransactionAsPaid() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(91L)
                .order(order)
                .provider(PaymentProvider.MOCK)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-123")
                .amount(order.getTotalAmount())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-123")))
                .thenReturn(Optional.of(transaction));
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.confirmMockPayment("  " + order.getOrderCode() + "  ", "  ref-token-123  ");

        assertEquals(PaymentStatus.PAID, response.status());
        assertNotNull(response.paidAt());
        assertFalse(response.canConfirmMock());
        verify(paymentTransactionRepository).saveAndFlush(transaction);
    }

    @Test
    void shouldReportOnlineOrderAsUnsettledWhenNoTransactionExists() {
        CustomerOrder onlineOrder = buildOrder(PaymentMethod.EWALLET);
        when(paymentTransactionRepository.findByOrderId(eq(onlineOrder.getId()))).thenReturn(Optional.empty());

        boolean settled = paymentService.isOrderPaymentSettled(onlineOrder);

        assertFalse(settled);
    }

    @Test
    void shouldAlwaysTreatOfflinePaymentAsSettled() {
        CustomerOrder codOrder = buildOrder(PaymentMethod.COD);

        boolean settled = paymentService.isOrderPaymentSettled(codOrder);

        assertTrue(settled);
        verify(paymentTransactionRepository, never()).findByOrderId(any());
    }

    private CustomerOrder buildOrder(PaymentMethod paymentMethod) {
        return CustomerOrder.builder()
                .id(10L)
                .orderCode("SH-ONLINE-1001")
                .paymentMethod(paymentMethod)
                .totalAmount(new BigDecimal("2450000.00"))
                .build();
    }
}
