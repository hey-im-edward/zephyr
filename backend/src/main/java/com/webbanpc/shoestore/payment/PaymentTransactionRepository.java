package com.webbanpc.shoestore.payment;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderId(Long orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select t
        from PaymentTransaction t
        where t.order.id = :orderId
        """)
    Optional<PaymentTransaction> findByOrderIdForUpdate(@Param("orderId") Long orderId);

    Optional<PaymentTransaction> findByOrderOrderCode(String orderCode);

    Optional<PaymentTransaction> findByOrderOrderCodeAndReferenceToken(String orderCode, String referenceToken);

    Optional<PaymentTransaction> findByReferenceToken(String referenceToken);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select t
        from PaymentTransaction t
        where t.order.orderCode = :orderCode
          and t.referenceToken = :referenceToken
        """)
    Optional<PaymentTransaction> findByOrderOrderCodeAndReferenceTokenForUpdate(
        @Param("orderCode") String orderCode,
        @Param("referenceToken") String referenceToken);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select t
        from PaymentTransaction t
        where t.referenceToken = :referenceToken
        """)
    Optional<PaymentTransaction> findByReferenceTokenForUpdate(@Param("referenceToken") String referenceToken);
}
