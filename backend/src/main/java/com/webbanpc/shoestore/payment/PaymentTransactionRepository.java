package com.webbanpc.shoestore.payment;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderId(Long orderId);

    Optional<PaymentTransaction> findByOrderOrderCode(String orderCode);

    Optional<PaymentTransaction> findByOrderOrderCodeAndReferenceToken(String orderCode, String referenceToken);
}
