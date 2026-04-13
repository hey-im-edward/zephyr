package com.webbanpc.shoestore.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.payment.vnpay")
public record VNPayProperties(
        String tmnCode,
        String hashSecret,
        String payUrl,
    String queryDrUrl,
        String returnUrl,
        String ipnUrl,
    @DefaultValue("127.0.0.1") String queryIpAddress,
    @DefaultValue("5000") int queryTimeoutMs,
        @DefaultValue("2.1.0") String version,
        @DefaultValue("pay") String command,
        @DefaultValue("VND") String currencyCode,
        @DefaultValue("vn") String locale,
        @DefaultValue("other") String orderType) {

    public VNPayProperties {
        tmnCode = normalizeOptional(tmnCode);
        hashSecret = normalizeOptional(hashSecret);
        payUrl = normalizeOptional(payUrl);
        queryDrUrl = normalizeOptional(queryDrUrl);
        returnUrl = normalizeOptional(returnUrl);
        ipnUrl = normalizeOptional(ipnUrl);
        queryIpAddress = normalize(queryIpAddress, "APP_PAYMENT_VNPAY_QUERY_IP_ADDRESS");
        if (queryTimeoutMs <= 0) {
            throw new IllegalStateException("APP_PAYMENT_VNPAY_QUERY_TIMEOUT_MS must be greater than 0.");
        }
        version = normalize(version, "APP_PAYMENT_VNPAY_VERSION");
        command = normalize(command, "APP_PAYMENT_VNPAY_COMMAND");
        currencyCode = normalize(currencyCode, "APP_PAYMENT_VNPAY_CURRENCY_CODE");
        locale = normalize(locale, "APP_PAYMENT_VNPAY_LOCALE");
        orderType = normalize(orderType, "APP_PAYMENT_VNPAY_ORDER_TYPE");
    }

    public boolean configuredForPay() {
        return tmnCode != null
                && hashSecret != null
                && payUrl != null
                && returnUrl != null;
    }

    public boolean configuredForQueryDr() {
        return tmnCode != null
                && hashSecret != null
                && queryDrUrl != null;
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