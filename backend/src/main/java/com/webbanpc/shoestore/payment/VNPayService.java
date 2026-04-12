package com.webbanpc.shoestore.payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.UUID;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.order.CustomerOrder;

@Service
public class VNPayService {

    private static final Logger LOGGER = LoggerFactory.getLogger(VNPayService.class);
    private static final DateTimeFormatter VNPAY_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VNPAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final VNPayProperties vnPayProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public VNPayService(VNPayProperties vnPayProperties, ObjectMapper objectMapper) {
        this.vnPayProperties = vnPayProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(vnPayProperties.queryTimeoutMs()))
                .build();
    }

    public VNPayCheckoutData createCheckoutData(
            CustomerOrder order,
            PaymentTransaction transaction,
            String clientIp) {
        assertConfiguredForPay();

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", Long.toString(toVnpAmount(transaction.getAmount())));
        params.put("vnp_Command", vnPayProperties.command());
        params.put("vnp_CreateDate", formatDate(LocalDateTime.now(VNPAY_ZONE)));
        params.put("vnp_CurrCode", vnPayProperties.currencyCode());
        params.put("vnp_ExpireDate", formatDate(transaction.getExpiresAt()));
        params.put("vnp_IpAddr", normalizeClientIp(clientIp));
        if (vnPayProperties.ipnUrl() != null) {
            params.put("vnp_IpnUrl", vnPayProperties.ipnUrl());
        }
        params.put("vnp_Locale", vnPayProperties.locale());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        params.put("vnp_OrderType", vnPayProperties.orderType());
        params.put("vnp_ReturnUrl", vnPayProperties.returnUrl());
        params.put("vnp_TmnCode", vnPayProperties.tmnCode());
        params.put("vnp_TxnRef", transaction.getReferenceToken());
        params.put("vnp_Version", vnPayProperties.version());

        String queryString = buildCanonicalQuery(params);
        String secureHash = hmacSha512(vnPayProperties.hashSecret(), queryString);
        String checkoutUrl = vnPayProperties.payUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        return new VNPayCheckoutData(checkoutUrl, transaction.getReferenceToken(), toVnpAmount(transaction.getAmount()));
    }

    public boolean isValidSignature(Map<String, String> callbackParams) {
        if (callbackParams == null || callbackParams.isEmpty()) {
            return false;
        }

        String hashSecret = normalizeOptional(vnPayProperties.hashSecret());
        if (hashSecret == null) {
            return false;
        }

        String providedSecureHash = normalizeOptional(callbackParams.get("vnp_SecureHash"));
        if (providedSecureHash == null) {
            return false;
        }

        String signingPayload = buildSigningPayloadFromCallback(callbackParams);
        String expectedSecureHash = hmacSha512(hashSecret, signingPayload);
        return providedSecureHash.equalsIgnoreCase(expectedSecureHash);
    }

    public VNPayCallbackData parseCallbackData(Map<String, String> callbackParams) {
        String txnRef = requiredParam(callbackParams, "vnp_TxnRef");
        long amount = parseLong(requiredParam(callbackParams, "vnp_Amount"), "vnp_Amount");
        String responseCode = requiredParam(callbackParams, "vnp_ResponseCode");
        String transactionStatus = requiredParam(callbackParams, "vnp_TransactionStatus");
        String transactionNo = normalizeOptional(callbackParams.get("vnp_TransactionNo"));
        String bankCode = normalizeOptional(callbackParams.get("vnp_BankCode"));

        return new VNPayCallbackData(txnRef, amount, responseCode, transactionStatus, transactionNo, bankCode);
    }

    public boolean isMatchingAmount(BigDecimal orderAmount, long callbackAmount) {
        return toVnpAmount(orderAmount) == callbackAmount;
    }

    public String buildCallbackInstruction(VNPayCallbackData callbackData) {
        StringBuilder instruction = new StringBuilder("VNPay callback")
                .append(" responseCode=").append(callbackData.responseCode())
                .append(", transactionStatus=").append(callbackData.transactionStatus());

        if (callbackData.transactionNo() != null) {
            instruction.append(", transactionNo=").append(callbackData.transactionNo());
        }

        if (callbackData.bankCode() != null) {
            instruction.append(", bankCode=").append(callbackData.bankCode());
        }

        return instruction.toString();
    }

    public Optional<VNPayQueryResult> queryTransaction(PaymentTransaction transaction) {
        if (transaction == null || !vnPayProperties.configuredForQueryDr()) {
            return Optional.empty();
        }

        try {
            String requestId = UUID.randomUUID().toString().replace("-", "");
            String command = "querydr";
            String txnRef = normalizeOptional(transaction.getReferenceToken());
            if (txnRef == null) {
                return Optional.empty();
            }

            LocalDateTime transactionDate = transaction.getCreatedAt();
            if (transactionDate == null) {
                return Optional.empty();
            }

            String version = vnPayProperties.version();
            String tmnCode = vnPayProperties.tmnCode();
            String orderInfo = "Query transaction " + transaction.getOrder().getOrderCode();
            String transactionDateValue = formatDate(transactionDate);
            String createDateValue = formatDate(LocalDateTime.now(VNPAY_ZONE));
            String ipAddress = vnPayProperties.queryIpAddress();

            String hashData = String.join(
                    "|",
                    requestId,
                    version,
                    command,
                    tmnCode,
                    txnRef,
                    transactionDateValue,
                    createDateValue,
                    ipAddress,
                    orderInfo);

            String secureHash = hmacSha512(vnPayProperties.hashSecret(), hashData);

            Map<String, String> payload = new TreeMap<>();
            payload.put("vnp_RequestId", requestId);
            payload.put("vnp_Version", version);
            payload.put("vnp_Command", command);
            payload.put("vnp_TmnCode", tmnCode);
            payload.put("vnp_TxnRef", txnRef);
            payload.put("vnp_OrderInfo", orderInfo);
            payload.put("vnp_TransactionDate", transactionDateValue);
            payload.put("vnp_CreateDate", createDateValue);
            payload.put("vnp_IpAddr", ipAddress);
            payload.put("vnp_SecureHash", secureHash);

            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder(URI.create(vnPayProperties.queryDrUrl()))
                    .timeout(Duration.ofMillis(vnPayProperties.queryTimeoutMs()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                LOGGER.warn("VNPay querydr HTTP status={} for txnRef={}", response.statusCode(), txnRef);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            String responseTxnRef = normalizeOptional(root.path("vnp_TxnRef").asText(null));
            String responseCode = normalizeOptional(root.path("vnp_ResponseCode").asText(null));
            String transactionStatus = normalizeOptional(root.path("vnp_TransactionStatus").asText(null));
            String transactionNo = normalizeOptional(root.path("vnp_TransactionNo").asText(null));
            String bankCode = normalizeOptional(root.path("vnp_BankCode").asText(null));
            String message = normalizeOptional(root.path("vnp_Message").asText(null));
            String payDate = normalizeOptional(root.path("vnp_PayDate").asText(null));

            String amountRaw = normalizeOptional(root.path("vnp_Amount").asText(null));
            long amount = amountRaw == null ? toVnpAmount(transaction.getAmount()) : parseLong(amountRaw, "vnp_Amount");
            LocalDateTime paidAt = parsePayDate(payDate);

            return Optional.of(new VNPayQueryResult(
                    responseTxnRef == null ? txnRef : responseTxnRef,
                    amount,
                    responseCode,
                    transactionStatus,
                    transactionNo,
                    bankCode,
                    paidAt,
                    message));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            LOGGER.warn("VNPay querydr interrupted for txnRef={}", transaction.getReferenceToken());
            return Optional.empty();
        } catch (Exception exception) {
            LOGGER.warn("VNPay querydr failed for txnRef={}: {}", transaction.getReferenceToken(), exception.getMessage());
            return Optional.empty();
        }
    }

    public String buildQueryInstruction(VNPayQueryResult queryResult) {
        StringBuilder instruction = new StringBuilder("VNPay querydr")
                .append(" responseCode=").append(queryResult.responseCode())
                .append(", transactionStatus=").append(queryResult.transactionStatus());

        if (queryResult.transactionNo() != null) {
            instruction.append(", transactionNo=").append(queryResult.transactionNo());
        }

        if (queryResult.bankCode() != null) {
            instruction.append(", bankCode=").append(queryResult.bankCode());
        }

        if (queryResult.message() != null) {
            instruction.append(", message=").append(queryResult.message());
        }

        return instruction.toString();
    }

    private String buildSigningPayloadFromCallback(Map<String, String> callbackParams) {
        Map<String, String> filtered = new TreeMap<>();
        for (Map.Entry<String, String> entry : callbackParams.entrySet()) {
            String key = entry.getKey();
            if (key == null || !key.startsWith("vnp_")) {
                continue;
            }

            if ("vnp_SecureHash".equals(key) || "vnp_SecureHashType".equals(key)) {
                continue;
            }

            String value = normalizeOptional(entry.getValue());
            if (value == null) {
                continue;
            }

            filtered.put(key, value);
        }

        return buildCanonicalQuery(filtered);
    }

    private String buildCanonicalQuery(Map<String, String> params) {
        StringJoiner joiner = new StringJoiner("&");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = normalizeOptional(entry.getKey());
            String value = normalizeOptional(entry.getValue());
            if (key == null || value == null) {
                continue;
            }

            joiner.add(urlEncode(key) + "=" + urlEncode(value));
        }
        return joiner.toString();
    }

    private void assertConfiguredForPay() {
        if (!vnPayProperties.configuredForPay()) {
            throw new BadRequestException("VNPay is not configured. Missing app.payment.vnpay settings.");
        }
    }

    private String requiredParam(Map<String, String> params, String key) {
        if (params == null || params.isEmpty()) {
            throw new BadRequestException("VNPay callback payload is empty.");
        }

        String value = normalizeOptional(params.get(key));
        if (value == null) {
            throw new BadRequestException(key + " is required.");
        }

        return value;
    }

    private long parseLong(String value, String fieldName) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException exception) {
            throw new BadRequestException(fieldName + " is invalid.");
        }
    }

    private long toVnpAmount(BigDecimal amount) {
        BigDecimal normalized = amount.setScale(2, RoundingMode.HALF_UP);
        return normalized.movePointRight(2).longValueExact();
    }

    private String normalizeClientIp(String clientIp) {
        String normalized = normalizeOptional(clientIp);
        if (normalized == null) {
            return "127.0.0.1";
        }

        return normalized.length() <= 45 ? normalized : normalized.substring(0, 45);
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            throw new BadRequestException("VNPay expiration date is missing.");
        }

        return dateTime.format(VNPAY_DATETIME_FORMATTER);
    }

    private String hmacSha512(String secret, String payload) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] rawBytes = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(rawBytes);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate VNPay secure hash.", exception);
        }
    }

    private String bytesToHex(byte[] data) {
        StringBuilder builder = new StringBuilder(data.length * 2);
        for (byte value : data) {
            builder.append(String.format("%02x", value));
        }
        return builder.toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private LocalDateTime parsePayDate(String payDate) {
        if (payDate == null) {
            return null;
        }

        try {
            return LocalDateTime.parse(payDate, VNPAY_DATETIME_FORMATTER);
        } catch (Exception exception) {
            return null;
        }
    }
}