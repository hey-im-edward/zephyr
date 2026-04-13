package com.webbanpc.shoestore.payment;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.order.CustomerOrder;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.order.PaymentMethod;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Service
@Transactional(readOnly = true)
public class PaymentService {

    private static final String VNPAY_PROVIDER_CODE = "VNPAY";
    private static final Set<String> VNPAY_PLACEHOLDER_TMN_CODES = Set.of("TESTTMNCODE", "DEMO", "SAMPLE");

    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentOnlineProperties paymentOnlineProperties;
    private final VNPayService vnPayService;

    @PersistenceContext
    private EntityManager entityManager;

    public PaymentService(
            CustomerOrderRepository customerOrderRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            PaymentOnlineProperties paymentOnlineProperties,
            VNPayService vnPayService) {
        this.customerOrderRepository = customerOrderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.paymentOnlineProperties = paymentOnlineProperties;
        this.vnPayService = vnPayService;
    }

    @Transactional
    public PaymentSessionResponse createOrRefreshSession(String orderCode) {
        return createOrRefreshSession(orderCode, "127.0.0.1");
    }

    @Transactional
    public PaymentSessionResponse createOrRefreshSession(String orderCode, String clientIp) {
        if (!paymentOnlineProperties.enabled()) {
            throw new BadRequestException("Online payment is currently disabled.");
        }

        CustomerOrder order = findOrderByCodeForUpdate(orderCode);
        if (!order.getPaymentMethod().isOnline()) {
            throw new BadRequestException("This order does not require an online payment session.");
        }

        LocalDateTime now = LocalDateTime.now();

        PaymentTransaction transaction = findByOrderIdForUpdate(order.getId())
                .orElseGet(() -> PaymentTransaction.builder()
                        .order(order)
                        .amount(order.getTotalAmount())
                        .createdAt(now)
                        .updatedAt(now)
                        .build());

        if (transaction.getStatus() == PaymentStatus.PAID) {
            return toResponse(order, transaction);
        }

        if (transaction.getExpiresAt() != null && transaction.getExpiresAt().isBefore(now)) {
            transaction.setStatus(PaymentStatus.EXPIRED);
        }

        if (transaction.getStatus() != PaymentStatus.PENDING_ACTION
                || transaction.getExpiresAt() == null
                || transaction.getExpiresAt().isBefore(now)
                || !isVnpayProvider(transaction.getProvider())) {
            prepareSession(order, transaction, now, clientIp);
            paymentTransactionRepository.saveAndFlush(transaction);
        }

        return toResponse(order, transaction);
    }

    public boolean isVnpaySignatureValid(Map<String, String> callbackParams) {
        return vnPayService.isValidSignature(callbackParams);
    }

    @Transactional
    public PaymentSessionResponse handleVnpayReturn(Map<String, String> callbackParams, boolean responseCodeSuccess) {
        VNPayCallbackData callbackData = vnPayService.parseCallbackData(callbackParams);
        PaymentTransaction transaction = findVnpayTransactionForUpdate(callbackData.txnRef());

        applyVnpayCallback(transaction, callbackData, responseCodeSuccess);
        return toResponse(transaction.getOrder(), transaction);
    }

    @Transactional
    public VNPayIpnResponse handleVnpayIpn(Map<String, String> callbackParams) {
        if (!vnPayService.isValidSignature(callbackParams)) {
            return VNPayIpnResponse.invalidSignature();
        }

        try {
            VNPayCallbackData callbackData = vnPayService.parseCallbackData(callbackParams);
            PaymentTransaction transaction = findByReferenceTokenForUpdate(callbackData.txnRef())
                    .orElse(null);

            if (transaction == null || !isVnpayProvider(transaction.getProvider())) {
                return VNPayIpnResponse.orderNotFound();
            }

            if (!vnPayService.isMatchingAmount(transaction.getAmount(), callbackData.amount())) {
                return VNPayIpnResponse.invalidAmount();
            }

            boolean responseCodeSuccess = "00".equals(callbackData.responseCode());
            if (isVnpayTransactionSuccessful(responseCodeSuccess, callbackData)
                    && transaction.getStatus() == PaymentStatus.PAID) {
                return VNPayIpnResponse.alreadyConfirmed();
            }

            applyVnpayCallback(transaction, callbackData, responseCodeSuccess);
            return VNPayIpnResponse.success();
        } catch (Exception exception) {
            return VNPayIpnResponse.systemError();
        }
    }

    @Transactional
    public PaymentSessionResponse confirmMockPayment(String orderCode, String referenceToken) {
        return confirmMockPayment(orderCode, referenceToken, "127.0.0.1");
    }

    @Transactional
    public PaymentSessionResponse confirmMockPayment(String orderCode, String referenceToken, String clientIp) {
        String normalizedOrderCode = normalizeOrderCode(orderCode);
        String normalizedReferenceToken = normalizeReference(referenceToken);
        PaymentTransaction transaction = findByOrderCodeAndReferenceTokenForUpdate(normalizedOrderCode, normalizedReferenceToken)
                .orElseThrow(() -> new ResourceNotFoundException("Payment session not found."));

        boolean localPlaceholderVnpayDemo = isEligibleLocalVnpayDemoConfirm(transaction, clientIp);
        if (transaction.getProvider() != PaymentProvider.MOCK && !localPlaceholderVnpayDemo) {
            throw new BadRequestException("This payment session must be confirmed by external webhook.");
        }

        if (transaction.getStatus() == PaymentStatus.PAID) {
            return toResponse(transaction.getOrder(), transaction);
        }

        if (transaction.getStatus() != PaymentStatus.PENDING_ACTION) {
            throw new BadRequestException("Payment session is not awaiting confirmation.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (transaction.getExpiresAt() != null && transaction.getExpiresAt().isBefore(now)) {
            transaction.setStatus(PaymentStatus.EXPIRED);
            transaction.setUpdatedAt(now);
            paymentTransactionRepository.saveAndFlush(transaction);
            throw new BadRequestException("Payment session has expired.");
        }

        transaction.setStatus(PaymentStatus.PAID);
        transaction.setPaidAt(now);
        if (localPlaceholderVnpayDemo) {
            transaction.setInstruction("Local demo confirmation for placeholder VNPay session.");
        }
        transaction.setUpdatedAt(now);
        paymentTransactionRepository.saveAndFlush(transaction);

        return toResponse(transaction.getOrder(), transaction);
    }

    @Transactional
    public PaymentSessionResponse getSessionStatus(String orderCode, String referenceToken) {
        PaymentTransaction transaction = findByOrderCodeAndReferenceTokenForUpdate(
            normalizeOrderCode(orderCode),
            normalizeReference(referenceToken))
                .orElseThrow(() -> new ResourceNotFoundException("Payment session not found."));

        reconcileVnpayStatusFromQueryDr(transaction);
        return toResponse(transaction.getOrder(), transaction);
    }

    public boolean isOrderPaymentSettled(CustomerOrder order) {
        if (!order.getPaymentMethod().isOnline()) {
            return true;
        }

        return paymentTransactionRepository.findByOrderId(order.getId())
                .map(transaction -> transaction.getStatus() == PaymentStatus.PAID)
                .orElse(false);
    }

    private CustomerOrder findOrderByCodeForUpdate(String orderCode) {
        return customerOrderRepository.findByOrderCodeForUpdate(normalizeOrderCode(orderCode))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }

    private Optional<PaymentTransaction> findByOrderIdForUpdate(Long orderId) {
        if (entityManager == null) {
            Optional<PaymentTransaction> locked = invokeRepositoryOptional(
                    "findByOrderIdForUpdate",
                    new Class<?>[]{Long.class},
                    orderId);
            return locked.isPresent()
                ? locked
                : invokeRepositoryOptional("findByOrderId", new Class<?>[]{Long.class}, orderId);
        }

        TypedQuery<PaymentTransaction> query = entityManager.createQuery("""
                select t
                from PaymentTransaction t
                where t.order.id = :orderId
                """, PaymentTransaction.class);
        query.setParameter("orderId", orderId);
        query.setLockMode(LockModeType.PESSIMISTIC_WRITE);
        return query.getResultStream().findFirst();
    }

    private Optional<PaymentTransaction> findByReferenceTokenForUpdate(String referenceToken) {
        String normalizedReference = normalizeReference(referenceToken);
        if (entityManager == null) {
            Optional<PaymentTransaction> locked = invokeRepositoryOptional(
                    "findByReferenceTokenForUpdate",
                    new Class<?>[]{String.class},
                    normalizedReference);
            return locked.isPresent()
                ? locked
                : invokeRepositoryOptional("findByReferenceToken", new Class<?>[]{String.class}, normalizedReference);
        }

        TypedQuery<PaymentTransaction> query = entityManager.createQuery("""
                select t
                from PaymentTransaction t
                where t.referenceToken = :referenceToken
                """, PaymentTransaction.class);
        query.setParameter("referenceToken", normalizedReference);
        query.setLockMode(LockModeType.PESSIMISTIC_WRITE);
        return query.getResultStream().findFirst();
    }

    private Optional<PaymentTransaction> findByOrderCodeAndReferenceTokenForUpdate(String orderCode, String referenceToken) {
        String normalizedOrderCode = normalizeOrderCode(orderCode);
        String normalizedReference = normalizeReference(referenceToken);
        if (entityManager == null) {
            Optional<PaymentTransaction> locked = invokeRepositoryOptional(
                    "findByOrderOrderCodeAndReferenceTokenForUpdate",
                    new Class<?>[]{String.class, String.class},
                    normalizedOrderCode,
                    normalizedReference);
            return locked.isPresent()
                    ? locked
                : invokeRepositoryOptional(
                    "findByOrderOrderCodeAndReferenceToken",
                    new Class<?>[]{String.class, String.class},
                    normalizedOrderCode,
                    normalizedReference);
        }

        TypedQuery<PaymentTransaction> query = entityManager.createQuery("""
                select t
                from PaymentTransaction t
                where t.order.orderCode = :orderCode
                  and t.referenceToken = :referenceToken
                """, PaymentTransaction.class);
        query.setParameter("orderCode", normalizedOrderCode);
        query.setParameter("referenceToken", normalizedReference);
        query.setLockMode(LockModeType.PESSIMISTIC_WRITE);
        return query.getResultStream().findFirst();
    }

    @SuppressWarnings("unchecked")
    private Optional<PaymentTransaction> invokeRepositoryOptional(String methodName, Class<?>[] parameterTypes, Object... args) {
        try {
            Object value = paymentTransactionRepository
                    .getClass()
                    .getMethod(methodName, parameterTypes)
                    .invoke(paymentTransactionRepository, args);
            if (value instanceof Optional<?> optional) {
                return (Optional<PaymentTransaction>) optional;
            }
        } catch (ReflectiveOperationException ignored) {
            // Fallback to non-locking repository methods when lock-specific method is unavailable.
        }
        return Optional.empty();
    }

    private boolean isVnpayProvider(PaymentProvider provider) {
        return provider != null && VNPAY_PROVIDER_CODE.equals(provider.name());
    }

    private PaymentProvider vnpayProvider() {
        return PaymentProvider.valueOf(VNPAY_PROVIDER_CODE);
    }

    private void prepareSession(CustomerOrder order, PaymentTransaction transaction, LocalDateTime now, String clientIp) {
        String referenceToken = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = now.plusMinutes(paymentOnlineProperties.sessionExpiryMinutes());

        transaction.setAmount(order.getTotalAmount());
        transaction.setStatus(PaymentStatus.PENDING_ACTION);
        transaction.setReferenceToken(referenceToken);
        transaction.setExpiresAt(expiresAt);
        transaction.setPaidAt(null);
        transaction.setCheckoutUrl(null);
        transaction.setQrImageUrl(null);
        transaction.setQrPayload(null);
        transaction.setWalletDeepLink(null);
        transaction.setInstruction(null);
        transaction.setUpdatedAt(now);

        PaymentMethod method = order.getPaymentMethod();
        if (method == PaymentMethod.CARD || method == PaymentMethod.EWALLET || method == PaymentMethod.BANK_QR) {
            transaction.setProvider(vnpayProvider());
            transaction.setChannel(resolveChannel(method));
            VNPayCheckoutData checkoutData = vnPayService.createCheckoutData(order, transaction, clientIp);
            transaction.setCheckoutUrl(checkoutData.checkoutUrl());
            transaction.setInstruction("Hoan tat thanh toan tren cong VNPay.");
            return;
        }

        throw new BadRequestException("Unsupported payment method.");
    }

    private PaymentTransaction findVnpayTransactionForUpdate(String referenceToken) {
        PaymentTransaction transaction = findByReferenceTokenForUpdate(referenceToken)
                .orElseThrow(() -> new ResourceNotFoundException("Payment session not found."));

        if (!isVnpayProvider(transaction.getProvider())) {
            throw new BadRequestException("This payment session is not handled by VNPay.");
        }

        return transaction;
    }

    private void applyVnpayCallback(
            PaymentTransaction transaction,
            VNPayCallbackData callbackData,
            boolean responseCodeSuccess) {
        if (!vnPayService.isMatchingAmount(transaction.getAmount(), callbackData.amount())) {
            throw new BadRequestException("VNPay callback amount does not match order amount.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (isVnpayTransactionSuccessful(responseCodeSuccess, callbackData)) {
            transaction.setStatus(PaymentStatus.PAID);
            transaction.setPaidAt(now);
        } else if (transaction.getStatus() == PaymentStatus.PENDING_ACTION) {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setPaidAt(null);
        }

        transaction.setInstruction(vnPayService.buildCallbackInstruction(callbackData));
        transaction.setUpdatedAt(now);
        paymentTransactionRepository.saveAndFlush(transaction);
    }

    private void reconcileVnpayStatusFromQueryDr(PaymentTransaction transaction) {
        if (!isVnpayProvider(transaction.getProvider()) || transaction.getStatus() != PaymentStatus.PENDING_ACTION) {
            return;
        }

        Optional<VNPayQueryResult> queryResultOptional = vnPayService.queryTransaction(transaction);
        if (queryResultOptional == null || queryResultOptional.isEmpty()) {
            return;
        }

        VNPayQueryResult queryResult = queryResultOptional.get();
        if (!vnPayService.isMatchingAmount(transaction.getAmount(), queryResult.amount())) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if ("00".equals(queryResult.responseCode()) && "00".equals(queryResult.transactionStatus())) {
            transaction.setStatus(PaymentStatus.PAID);
            transaction.setPaidAt(queryResult.paidAt() != null ? queryResult.paidAt() : now);
        } else if ("00".equals(queryResult.responseCode()) && queryResult.transactionStatus() != null) {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setPaidAt(null);
        }

        transaction.setInstruction(vnPayService.buildQueryInstruction(queryResult));
        transaction.setUpdatedAt(now);
        paymentTransactionRepository.saveAndFlush(transaction);
    }

    private boolean isVnpayTransactionSuccessful(boolean responseCodeSuccess, VNPayCallbackData callbackData) {
        return responseCodeSuccess && "00".equals(callbackData.transactionStatus());
    }

    private PaymentChannel resolveChannel(PaymentMethod method) {
        return switch (method) {
            case CARD -> PaymentChannel.CARD;
            case BANK_QR -> PaymentChannel.BANK_QR;
            case EWALLET -> PaymentChannel.EWALLET;
            default -> throw new BadRequestException("Unsupported payment method.");
        };
    }

    private boolean isEligibleLocalVnpayDemoConfirm(PaymentTransaction transaction, String clientIp) {
        if (!isVnpayProvider(transaction.getProvider()) || transaction.getStatus() != PaymentStatus.PENDING_ACTION) {
            return false;
        }

        if (!isLocalClientIp(clientIp)) {
            return false;
        }

        return isPlaceholderTmnCode(transaction.getCheckoutUrl());
    }

    private boolean isLocalClientIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return false;
        }

        String normalized = clientIp.trim();
        return "127.0.0.1".equals(normalized)
                || "::1".equals(normalized)
                || "0:0:0:0:0:0:0:1".equals(normalized);
    }

    private boolean isPlaceholderTmnCode(String checkoutUrl) {
        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            return false;
        }

        try {
            String tmnCode = UriComponentsBuilder.fromUriString(checkoutUrl)
                    .build()
                    .getQueryParams()
                    .getFirst("vnp_TmnCode");
            if (tmnCode == null || tmnCode.isBlank()) {
                return false;
            }

            return VNPAY_PLACEHOLDER_TMN_CODES.contains(tmnCode.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            return false;
        }
    }

    private PaymentSessionResponse toResponse(CustomerOrder order, PaymentTransaction transaction) {
        return new PaymentSessionResponse(
                order.getOrderCode(),
                order.getPaymentMethod(),
                transaction.getProvider(),
                transaction.getChannel(),
                transaction.getStatus(),
                transaction.getAmount(),
                transaction.getReferenceToken(),
                transaction.getCheckoutUrl(),
                transaction.getQrImageUrl(),
                transaction.getQrPayload(),
                transaction.getWalletDeepLink(),
                transaction.getInstruction(),
                transaction.getExpiresAt(),
                transaction.getPaidAt(),
                transaction.getProvider() == PaymentProvider.MOCK && transaction.getStatus() == PaymentStatus.PENDING_ACTION);
    }

    private String normalizeOrderCode(String orderCode) {
        if (orderCode == null || orderCode.trim().isBlank()) {
            throw new BadRequestException("orderCode is required.");
        }
        return orderCode.trim();
    }

    private String normalizeReference(String referenceToken) {
        if (referenceToken == null || referenceToken.trim().isBlank()) {
            throw new BadRequestException("referenceToken is required.");
        }
        return referenceToken.trim();
    }
}
