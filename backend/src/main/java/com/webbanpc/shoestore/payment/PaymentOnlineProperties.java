package com.webbanpc.shoestore.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.payment.online")
public record PaymentOnlineProperties(
        @DefaultValue("true") boolean enabled,
        @DefaultValue("15") int sessionExpiryMinutes,
        @DefaultValue("http://localhost:3000/checkout") String mockCheckoutBaseUrl,
        @DefaultValue("momo://app?action=pay&orderCode={orderCode}&amount={amount}") String walletDeepLinkTemplate,
        String vietQrBankCode,
        String vietQrAccountNumber,
        String vietQrAccountName) {

    public PaymentOnlineProperties {
        if (sessionExpiryMinutes <= 0) {
            throw new IllegalStateException("APP_PAYMENT_ONLINE_SESSION_EXPIRY_MINUTES must be greater than 0.");
        }

        mockCheckoutBaseUrl = normalize(mockCheckoutBaseUrl, "APP_PAYMENT_ONLINE_MOCK_CHECKOUT_BASE_URL");
        walletDeepLinkTemplate = normalize(walletDeepLinkTemplate, "APP_PAYMENT_ONLINE_WALLET_DEEPLINK_TEMPLATE");
        vietQrBankCode = normalizeOptional(vietQrBankCode);
        vietQrAccountNumber = normalizeOptional(vietQrAccountNumber);
        vietQrAccountName = normalizeOptional(vietQrAccountName);
    }

    private static String normalize(String value, String propertyName) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new IllegalStateException(propertyName + " must not be blank.");
        }
        return normalized;
    }

    private static String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
