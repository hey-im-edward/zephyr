package com.webbanpc.shoestore.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.webbanpc.shoestore.order.CustomerOrder;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.order.PaymentMethod;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PaymentServiceSessionTests {

        private static final PaymentProvider VNPAY_PROVIDER = PaymentProvider.valueOf("VNPAY");

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private PaymentOnlineProperties paymentOnlineProperties;

    @Mock
    private VNPayService vnPayService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                customerOrderRepository,
                paymentTransactionRepository,
                paymentOnlineProperties,
                vnPayService);
    }

    @Test
    void shouldCreateCardSessionWithVnpayCheckoutUrl() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);

        when(paymentOnlineProperties.enabled()).thenReturn(true);
        when(paymentOnlineProperties.sessionExpiryMinutes()).thenReturn(15);
        when(customerOrderRepository.findByOrderCodeForUpdate(eq(order.getOrderCode()))).thenReturn(Optional.of(order));
        when(paymentTransactionRepository.findByOrderId(eq(order.getId()))).thenReturn(Optional.empty());
        when(vnPayService.createCheckoutData(eq(order), any(PaymentTransaction.class), anyString()))
                .thenReturn(new VNPayCheckoutData(
                        "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=demo",
                        "demo",
                        245000000L));
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.createOrRefreshSession(order.getOrderCode(), "203.0.113.10");

        assertEquals(VNPAY_PROVIDER, response.provider());
        assertEquals(PaymentChannel.CARD, response.channel());
        assertEquals(PaymentStatus.PENDING_ACTION, response.status());
        assertNotNull(response.checkoutUrl());
        assertFalse(response.canConfirmMock());
    }

    @Test
    void shouldCreateBankQrSessionWithVnpayCheckoutUrl() {
        CustomerOrder order = buildOrder(PaymentMethod.BANK_QR);

        when(paymentOnlineProperties.enabled()).thenReturn(true);
        when(paymentOnlineProperties.sessionExpiryMinutes()).thenReturn(15);
        when(customerOrderRepository.findByOrderCodeForUpdate(eq(order.getOrderCode()))).thenReturn(Optional.of(order));
        when(paymentTransactionRepository.findByOrderId(eq(order.getId()))).thenReturn(Optional.empty());
        when(vnPayService.createCheckoutData(eq(order), any(PaymentTransaction.class), anyString()))
            .thenReturn(new VNPayCheckoutData(
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=demo",
                "demo",
                245000000L));
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.createOrRefreshSession(order.getOrderCode(), "203.0.113.10");

        assertEquals(VNPAY_PROVIDER, response.provider());
        assertEquals(PaymentChannel.BANK_QR, response.channel());
        assertEquals(PaymentStatus.PENDING_ACTION, response.status());
        assertNotNull(response.checkoutUrl());
        assertFalse(response.canConfirmMock());
    }

    @Test
    void shouldMarkVnpayReturnAsPaidWhenResponseAndTransactionStatusSuccessful() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(93L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-vnp")
                .amount(order.getTotalAmount())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        VNPayCallbackData callbackData = new VNPayCallbackData(
                "ref-token-vnp",
                245000000L,
                "00",
                "00",
                "VN12345",
                "NCB");

        when(vnPayService.parseCallbackData(anyMap())).thenReturn(callbackData);
        stubOptionalPaymentTransactionMethod(
                "findByReferenceTokenForUpdate",
                new Class<?>[]{String.class},
                Optional.of(transaction),
                "ref-token-vnp");
        when(vnPayService.isMatchingAmount(eq(order.getTotalAmount()), eq(245000000L))).thenReturn(true);
        when(vnPayService.buildCallbackInstruction(eq(callbackData))).thenReturn("VNPay callback responseCode=00, transactionStatus=00");
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.handleVnpayReturn(Map.of("vnp_ResponseCode", "00"), true);

        assertEquals(PaymentStatus.PAID, response.status());
        assertNotNull(response.paidAt());
        verify(paymentTransactionRepository).saveAndFlush(transaction);
    }

    @Test
    void shouldReturnInvalidSignatureForVnpayIpn() {
        when(vnPayService.isValidSignature(anyMap())).thenReturn(false);

        VNPayIpnResponse response = paymentService.handleVnpayIpn(Map.of("vnp_TxnRef", "abc"));

        assertEquals("97", response.RspCode());
    }

    @Test
    void shouldReturnAlreadyConfirmedForRepeatedSuccessfulVnpayIpn() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(94L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PAID)
                .referenceToken("ref-token-vnp")
                .amount(order.getTotalAmount())
                .paidAt(LocalDateTime.now().minusMinutes(1))
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        VNPayCallbackData callbackData = new VNPayCallbackData(
                "ref-token-vnp",
                245000000L,
                "00",
                "00",
                "VN12345",
                "NCB");

        when(vnPayService.isValidSignature(anyMap())).thenReturn(true);
        when(vnPayService.parseCallbackData(anyMap())).thenReturn(callbackData);
        stubOptionalPaymentTransactionMethod(
                "findByReferenceTokenForUpdate",
                new Class<?>[]{String.class},
                Optional.of(transaction),
                "ref-token-vnp");
        when(vnPayService.isMatchingAmount(eq(order.getTotalAmount()), eq(245000000L))).thenReturn(true);

        VNPayIpnResponse response = paymentService.handleVnpayIpn(Map.of("vnp_SecureHash", "valid"));

        assertEquals("02", response.RspCode());
        verify(paymentTransactionRepository, never()).saveAndFlush(any(PaymentTransaction.class));
    }

    @Test
    void shouldReconcilePendingVnpayStatusWithQuerydr() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(95L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-querydr")
                .amount(order.getTotalAmount())
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        LocalDateTime paidAt = LocalDateTime.now().minusSeconds(30);
        VNPayQueryResult queryResult = new VNPayQueryResult(
                "ref-token-querydr",
                245000000L,
                "00",
                "00",
                "VN778899",
                "NCB",
                paidAt,
                "Confirm Success");

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-querydr")))
                .thenReturn(Optional.of(transaction));
        when(vnPayService.queryTransaction(eq(transaction))).thenReturn(Optional.of(queryResult));
        when(vnPayService.isMatchingAmount(eq(order.getTotalAmount()), eq(245000000L))).thenReturn(true);
        when(vnPayService.buildQueryInstruction(eq(queryResult)))
                .thenReturn("VNPay querydr responseCode=00, transactionStatus=00");
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.getSessionStatus(order.getOrderCode(), "ref-token-querydr");

        assertEquals(PaymentStatus.PAID, response.status());
        assertNotNull(response.paidAt());
        verify(paymentTransactionRepository).saveAndFlush(transaction);
    }

    @Test
    void shouldKeepPendingWhenQuerydrReturnsEmpty() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(96L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-querydr-empty")
                .amount(order.getTotalAmount())
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-querydr-empty")))
                .thenReturn(Optional.of(transaction));
        when(vnPayService.queryTransaction(eq(transaction))).thenReturn(Optional.empty());

        PaymentSessionResponse response = paymentService.getSessionStatus(order.getOrderCode(), "ref-token-querydr-empty");

        assertEquals(PaymentStatus.PENDING_ACTION, response.status());
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
    void shouldTreatRepeatedMockConfirmationAsIdempotent() {
        CustomerOrder order = buildOrder(PaymentMethod.CARD);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(92L)
                .order(order)
                .provider(PaymentProvider.MOCK)
                .channel(PaymentChannel.CARD)
                .status(PaymentStatus.PAID)
                .referenceToken("ref-token-321")
                .amount(order.getTotalAmount())
                .paidAt(LocalDateTime.now().minusMinutes(1))
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-321")))
                .thenReturn(Optional.of(transaction));

        PaymentSessionResponse response = paymentService.confirmMockPayment(order.getOrderCode(), "ref-token-321");

        assertEquals(PaymentStatus.PAID, response.status());
        verify(paymentTransactionRepository, never()).saveAndFlush(any(PaymentTransaction.class));
    }

    @Test
    void shouldAllowLocalPlaceholderVnpayDemoConfirmation() {
        CustomerOrder order = buildOrder(PaymentMethod.BANK_QR);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(97L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.BANK_QR)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-local-demo")
                .checkoutUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TmnCode=TESTTMNCODE&vnp_TxnRef=ref-token-local-demo")
                .amount(order.getTotalAmount())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-local-demo")))
                .thenReturn(Optional.of(transaction));
        when(paymentTransactionRepository.saveAndFlush(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentSessionResponse response = paymentService.confirmMockPayment(order.getOrderCode(), "ref-token-local-demo", "127.0.0.1");

        assertEquals(PaymentStatus.PAID, response.status());
        assertNotNull(response.paidAt());
        verify(paymentTransactionRepository).saveAndFlush(transaction);
    }

    @Test
    void shouldRejectRemoteVnpayDemoConfirmation() {
        CustomerOrder order = buildOrder(PaymentMethod.BANK_QR);
        PaymentTransaction transaction = PaymentTransaction.builder()
                .id(98L)
                .order(order)
                .provider(VNPAY_PROVIDER)
                .channel(PaymentChannel.BANK_QR)
                .status(PaymentStatus.PENDING_ACTION)
                .referenceToken("ref-token-remote-demo")
                .checkoutUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TmnCode=TESTTMNCODE&vnp_TxnRef=ref-token-remote-demo")
                .amount(order.getTotalAmount())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .updatedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(paymentTransactionRepository.findByOrderOrderCodeAndReferenceToken(eq(order.getOrderCode()), eq("ref-token-remote-demo")))
                .thenReturn(Optional.of(transaction));

        org.junit.jupiter.api.Assertions.assertThrows(
                com.webbanpc.shoestore.common.BadRequestException.class,
                () -> paymentService.confirmMockPayment(order.getOrderCode(), "ref-token-remote-demo", "203.0.113.10"));

        verify(paymentTransactionRepository, never()).saveAndFlush(any(PaymentTransaction.class));
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

        @SuppressWarnings("unchecked")
        private void stubOptionalPaymentTransactionMethod(
                        String methodName,
                        Class<?>[] parameterTypes,
                        Optional<PaymentTransaction> returnedValue,
                        Object... arguments) {
                try {
                        Method method = paymentTransactionRepository.getClass().getMethod(methodName, parameterTypes);
                        when((Optional<PaymentTransaction>) method.invoke(paymentTransactionRepository, arguments))
                                        .thenReturn(returnedValue);
                } catch (ReflectiveOperationException exception) {
                        throw new IllegalStateException("Failed to stub repository method: " + methodName, exception);
                }
        }
}
