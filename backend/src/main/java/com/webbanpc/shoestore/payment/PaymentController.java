package com.webbanpc.shoestore.payment;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/sessions")
    public PaymentSessionResponse createSession(@Valid @RequestBody PaymentSessionRequest request) {
        return paymentService.createOrRefreshSession(request.orderCode());
    }

    @GetMapping("/sessions/status")
    public PaymentSessionResponse getSessionStatus(
            @RequestParam String orderCode,
            @RequestParam String referenceToken) {
        return paymentService.getSessionStatus(orderCode, referenceToken);
    }

    @PostMapping("/mock/confirm")
    public PaymentSessionResponse confirmMockPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        return paymentService.confirmMockPayment(request.orderCode(), request.referenceToken());
    }
}
