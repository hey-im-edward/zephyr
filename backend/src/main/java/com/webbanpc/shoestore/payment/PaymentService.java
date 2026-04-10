package com.webbanpc.shoestore.payment;

import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.order.CustomerOrder;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.order.PaymentMethod;

@Service
@Transactional(readOnly = true)
public class PaymentService {

    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentOnlineProperties paymentOnlineProperties;

    public PaymentService(
            CustomerOrderRepository customerOrderRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            PaymentOnlineProperties paymentOnlineProperties) {
        this.customerOrderRepository = customerOrderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.paymentOnlineProperties = paymentOnlineProperties;
    }

    @Transactional
    public PaymentSessionResponse createOrRefreshSession(String orderCode) {
        if (!paymentOnlineProperties.enabled()) {
            throw new BadRequestException("Online payment is currently disabled.");
        }

        CustomerOrder order = findOrderByCode(orderCode);
        if (!order.getPaymentMethod().isOnline()) {
            throw new BadRequestException("This order does not require an online payment session.");
        }

        LocalDateTime now = LocalDateTime.now();

        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(order.getId())
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
                || transaction.getExpiresAt().isBefore(now)) {
            prepareSession(order, transaction, now);
            paymentTransactionRepository.saveAndFlush(transaction);
        }

        return toResponse(order, transaction);
    }

    @Transactional
    public PaymentSessionResponse confirmMockPayment(String orderCode, String referenceToken) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findByOrderOrderCodeAndReferenceToken(normalizeOrderCode(orderCode), normalizeReference(referenceToken))
                .orElseThrow(() -> new ResourceNotFoundException("Payment session not found."));

        if (transaction.getProvider() != PaymentProvider.MOCK) {
            throw new BadRequestException("This payment session must be confirmed by external webhook.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (transaction.getExpiresAt() != null && transaction.getExpiresAt().isBefore(now)) {
            transaction.setStatus(PaymentStatus.EXPIRED);
            transaction.setUpdatedAt(now);
            paymentTransactionRepository.saveAndFlush(transaction);
            throw new BadRequestException("Payment session has expired.");
        }

        if (transaction.getStatus() != PaymentStatus.PAID) {
            transaction.setStatus(PaymentStatus.PAID);
            transaction.setPaidAt(now);
            transaction.setUpdatedAt(now);
            paymentTransactionRepository.saveAndFlush(transaction);
        }

        return toResponse(transaction.getOrder(), transaction);
    }

    public PaymentSessionResponse getSessionStatus(String orderCode, String referenceToken) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findByOrderOrderCodeAndReferenceToken(normalizeOrderCode(orderCode), normalizeReference(referenceToken))
                .orElseThrow(() -> new ResourceNotFoundException("Payment session not found."));
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

    private CustomerOrder findOrderByCode(String orderCode) {
        return customerOrderRepository.findByOrderCode(normalizeOrderCode(orderCode))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
    }

    private void prepareSession(CustomerOrder order, PaymentTransaction transaction, LocalDateTime now) {
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
        if (method == PaymentMethod.CARD) {
            transaction.setProvider(PaymentProvider.MOCK);
            transaction.setChannel(PaymentChannel.CARD);
            transaction.setCheckoutUrl(buildMockCheckoutUrl(order, referenceToken));
            transaction.setInstruction("Mở trang thanh toán thẻ và xác nhận giao dịch để hoàn tất đơn.");
            return;
        }

        if (method == PaymentMethod.EWALLET) {
            transaction.setProvider(PaymentProvider.MOCK);
            transaction.setChannel(PaymentChannel.EWALLET);
            transaction.setWalletDeepLink(buildWalletDeepLink(order, referenceToken));
            transaction.setInstruction("Mở ứng dụng ví, xác nhận thanh toán rồi quay lại storefront.");
            return;
        }

        if (method == PaymentMethod.BANK_QR) {
            transaction.setProvider(PaymentProvider.VIETQR);
            transaction.setChannel(PaymentChannel.BANK_QR);
            String transferContent = buildTransferContent(order, referenceToken);
            transaction.setQrPayload(transferContent);
            transaction.setQrImageUrl(buildVietQrImageUrl(order, transferContent));
            transaction.setInstruction("Quét mã QR ngân hàng để chuyển khoản đúng số tiền và nội dung đối soát.");
            return;
        }

        throw new BadRequestException("Unsupported online payment method.");
    }

    private String buildMockCheckoutUrl(CustomerOrder order, String referenceToken) {
        String baseUrl = paymentOnlineProperties.mockCheckoutBaseUrl();
        String separator = baseUrl.contains("?") ? "&" : "?";
        return baseUrl
                + separator
                + "paymentMock=true"
                + "&orderCode=" + urlEncode(order.getOrderCode())
                + "&ref=" + urlEncode(referenceToken);
    }

    private String buildWalletDeepLink(CustomerOrder order, String referenceToken) {
        String template = paymentOnlineProperties.walletDeepLinkTemplate();
        return template
                .replace("{orderCode}", urlEncode(order.getOrderCode()))
                .replace("{amount}", order.getTotalAmount().setScale(0, RoundingMode.DOWN).toPlainString())
                .replace("{reference}", urlEncode(referenceToken));
    }

    private String buildTransferContent(CustomerOrder order, String referenceToken) {
        String shortReference = referenceToken.length() > 10 ? referenceToken.substring(0, 10) : referenceToken;
        return "ORDER " + order.getOrderCode() + " " + shortReference;
    }

    private String buildVietQrImageUrl(CustomerOrder order, String transferContent) {
        String bankCode = paymentOnlineProperties.vietQrBankCode();
        String accountNumber = paymentOnlineProperties.vietQrAccountNumber();
        String accountName = paymentOnlineProperties.vietQrAccountName();

        if (bankCode == null || accountNumber == null || accountName == null) {
            throw new BadRequestException("BANK_QR is not configured. Missing VietQR bank/account settings.");
        }

        String amount = order.getTotalAmount().setScale(0, RoundingMode.DOWN).toPlainString();
        return "https://img.vietqr.io/image/"
                + bankCode
                + "-"
                + accountNumber
                + "-compact2.png?amount="
                + amount
                + "&addInfo="
                + urlEncode(transferContent)
                + "&accountName="
                + urlEncode(accountName);
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

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
