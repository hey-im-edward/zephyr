package com.webbanpc.shoestore.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.common.BadRequestException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRateLimiter paymentRateLimiter;
    private final PaymentOnlineProperties paymentOnlineProperties;

    public PaymentController(
            PaymentService paymentService,
            PaymentRateLimiter paymentRateLimiter,
            PaymentOnlineProperties paymentOnlineProperties) {
        this.paymentService = paymentService;
        this.paymentRateLimiter = paymentRateLimiter;
        this.paymentOnlineProperties = paymentOnlineProperties;
    }

    @PostMapping("/sessions")
    public PaymentSessionResponse createSession(
            @Valid @RequestBody PaymentSessionRequest request,
            HttpServletRequest servletRequest) {
        paymentRateLimiter.assertAllowed(buildRateLimitKey("create-session", request.orderCode(), null, servletRequest));
        return paymentService.createOrRefreshSession(request.orderCode(), resolveClientIp(servletRequest));
    }

    @GetMapping("/sessions/status")
    public PaymentSessionResponse getSessionStatus(
            @RequestParam String orderCode,
            @RequestParam String referenceToken,
            HttpServletRequest servletRequest) {
        paymentRateLimiter.assertAllowed(buildRateLimitKey("session-status", orderCode, referenceToken, servletRequest));
        return paymentService.getSessionStatus(orderCode, referenceToken);
    }

    @PostMapping("/mock/confirm")
    public PaymentSessionResponse confirmMockPayment(
            @Valid @RequestBody PaymentConfirmRequest request,
            HttpServletRequest servletRequest) {
        paymentRateLimiter.assertAllowed(buildRateLimitKey("mock-confirm", request.orderCode(), request.referenceToken(), servletRequest));
        return paymentService.confirmMockPayment(request.orderCode(), request.referenceToken(), resolveClientIp(servletRequest));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<?> handleVnpayReturn(
            @RequestParam Map<String, String> callbackParams,
            HttpServletRequest servletRequest) {
        paymentRateLimiter.assertAllowed(buildRateLimitKey("vnpay-return", callbackParams.get("vnp_TxnRef"), null, servletRequest));

        if (!paymentService.isVnpaySignatureValid(callbackParams)) {
            throw new BadRequestException("Invalid VNPay secure hash.");
        }

        boolean responseCodeSuccess = "00".equals(callbackParams.get("vnp_ResponseCode"));
        PaymentSessionResponse response = paymentService.handleVnpayReturn(callbackParams, responseCodeSuccess);

        if (expectsJson(servletRequest)) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(buildVnpayReturnHtml(response, callbackParams));
    }

    @GetMapping("/vnpay/ipn")
    public VNPayIpnResponse handleVnpayIpn(
            @RequestParam Map<String, String> callbackParams,
            HttpServletRequest servletRequest) {
        paymentRateLimiter.assertAllowed(buildRateLimitKey("vnpay-ipn", callbackParams.get("vnp_TxnRef"), null, servletRequest));
        return paymentService.handleVnpayIpn(callbackParams);
    }

    private String buildRateLimitKey(String action, String orderCode, String referenceToken, HttpServletRequest servletRequest) {
        StringBuilder key = new StringBuilder(action)
                .append(':')
                .append(normalizeSegment(orderCode))
                .append(':');

        if (referenceToken != null) {
            key.append(normalizeSegment(referenceToken));
        }

        key.append(':').append(resolveClientIp(servletRequest));
        return key.toString();
    }

    private boolean expectsJson(HttpServletRequest servletRequest) {
        String acceptHeader = servletRequest.getHeader("Accept");
        if (acceptHeader == null || acceptHeader.isBlank()) {
            return true;
        }

        String normalizedAccept = acceptHeader.toLowerCase(Locale.ROOT);
        if (normalizedAccept.contains(MediaType.APPLICATION_JSON_VALUE)) {
            return true;
        }

        return !normalizedAccept.contains(MediaType.TEXT_HTML_VALUE);
    }

    private String buildVnpayReturnHtml(PaymentSessionResponse response, Map<String, String> callbackParams) {
        String returnUrl = buildFrontendPaymentStatusUrl(response, callbackParams);
        boolean success = response.status() == PaymentStatus.PAID;
        String title = success ? "Thanh toan thanh cong" : "Thanh toan chua hoan tat";
        String summary = success
                ? "VNPay da xac nhan thanh toan. Ban co the quay ve website de theo doi trang thai don."
                : "VNPay tra ve trang thai chua thanh cong. Ban co the quay ve website de kiem tra lai hoac tao phien moi.";
        String responseCode = escapeHtml(normalizeSegment(callbackParams.get("vnp_ResponseCode")));
        String transactionStatus = escapeHtml(normalizeSegment(callbackParams.get("vnp_TransactionStatus")));
        String orderCode = escapeHtml(response.orderCode());
        String safeReturnUrl = escapeHtml(returnUrl);

        return """
                <!doctype html>
                <html lang=\"vi\">
                    <head>
                        <meta charset=\"UTF-8\" />
                        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
                        <title>VNPay return</title>
                        <style>
                            :root { color-scheme: light; }
                            body {
                                margin: 0;
                                min-height: 100vh;
                                display: grid;
                                place-items: center;
                                padding: 24px;
                                font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;
                                background: radial-gradient(circle at top, #f3f8ff, #f9fafb 55%, #eef2ff 100%);
                                color: #0f172a;
                            }
                            .card {
                                width: min(620px, 100%);
                                border: 1px solid #dbeafe;
                                border-radius: 24px;
                                background: rgba(255, 255, 255, 0.94);
                                padding: 28px;
                                box-shadow: 0 24px 50px rgba(15, 23, 42, 0.1);
                            }
                            .title {
                                margin: 0;
                                font-size: 28px;
                                line-height: 1.3;
                            }
                            .summary {
                                margin-top: 12px;
                                color: #334155;
                                line-height: 1.65;
                            }
                            .meta {
                                margin-top: 16px;
                                font-size: 14px;
                                color: #475569;
                            }
                            .actions {
                                margin-top: 22px;
                                display: flex;
                                flex-wrap: wrap;
                                gap: 12px;
                            }
                            .btn {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                padding: 12px 18px;
                                border-radius: 999px;
                                border: 1px solid #bfdbfe;
                                text-decoration: none;
                                font-weight: 600;
                            }
                            .btn-primary {
                                background: #0f172a;
                                color: #ffffff;
                                border-color: #0f172a;
                            }
                            .btn-secondary {
                                background: #ffffff;
                                color: #0f172a;
                            }
                        </style>
                    </head>
                    <body>
                        <main class=\"card\">
                            <h1 class=\"title\">%s</h1>
                            <p class=\"summary\">%s</p>
                            <p class=\"meta\">Ma don: <strong>%s</strong></p>
                            <p class=\"meta\">responseCode=%s, transactionStatus=%s</p>
                            <div class=\"actions\">
                                <a class=\"btn btn-primary\" href=\"%s\">Quay ve website</a>
                                <a class=\"btn btn-secondary\" href=\"%s\">Tai lai trang trang thai</a>
                            </div>
                        </main>
                        <script>
                            setTimeout(function () {
                                window.location.href = %s;
                            }, 4500);
                        </script>
                    </body>
                </html>
                """.formatted(
                escapeHtml(title),
                escapeHtml(summary),
                orderCode,
                responseCode,
                transactionStatus,
                safeReturnUrl,
                safeReturnUrl,
                jsonStringLiteral(returnUrl));
    }

    private String buildFrontendPaymentStatusUrl(PaymentSessionResponse response, Map<String, String> callbackParams) {
        String checkoutBaseUrl = paymentOnlineProperties.mockCheckoutBaseUrl();
        String normalizedCheckoutBase = checkoutBaseUrl.endsWith("/")
                ? checkoutBaseUrl.substring(0, checkoutBaseUrl.length() - 1)
                : checkoutBaseUrl;
        String paymentStatusUrl = normalizedCheckoutBase + "/payment";

        return new StringBuilder(paymentStatusUrl)
                .append("?orderCode=").append(urlEncode(response.orderCode()))
                .append("&referenceToken=").append(urlEncode(response.referenceToken()))
                .append("&gatewayResult=").append(response.status() == PaymentStatus.PAID ? "success" : "failed")
                .append("&responseCode=").append(urlEncode(normalizeSegment(callbackParams.get("vnp_ResponseCode"))))
                .append("&transactionStatus=").append(urlEncode(normalizeSegment(callbackParams.get("vnp_TransactionStatus"))))
                .toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String jsonStringLiteral(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String resolveClientIp(HttpServletRequest servletRequest) {
        String forwardedFor = servletRequest.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String firstIp = forwardedFor.split(",")[0].trim();
            if (!firstIp.isBlank()) {
                return firstIp;
            }
        }

        String remoteAddr = servletRequest.getRemoteAddr();
        return remoteAddr == null || remoteAddr.isBlank() ? "unknown" : remoteAddr;
    }

    private String normalizeSegment(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }

        String normalized = value.trim();
        if (normalized.length() <= 64) {
            return normalized;
        }

        return normalized.substring(0, 64);
    }
}
