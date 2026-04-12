package com.webbanpc.shoestore.order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByOrderCode(String orderCode);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select o
      from CustomerOrder o
      where o.orderCode = :orderCode
      """)
  Optional<CustomerOrder> findByOrderCodeForUpdate(@Param("orderCode") String orderCode);

    @EntityGraph(attributePaths = { "items", "user" })
    Optional<CustomerOrder> findWithItemsById(Long id);

    @EntityGraph(attributePaths = { "items", "user" })
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select o
            from CustomerOrder o
            where o.id = :id
            """)
    Optional<CustomerOrder> findWithItemsByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = { "items", "user" })
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "shippingMethod", "promotion" })
    Page<CustomerOrder> findAllByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = { "shippingMethod", "promotion" })
    @Query("""
            select o
            from CustomerOrder o
            where (:status is null or o.status = :status)
              and (
                :query is null
                or lower(o.orderCode) like concat('%', lower(:query), '%')
                or lower(o.customerName) like concat('%', lower(:query), '%')
                or lower(o.email) like concat('%', lower(:query), '%')
              )
            """)
    Page<CustomerOrder> findAllForAdmin(@Param("status") OrderStatus status, @Param("query") String query, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.status <> com.webbanpc.shoestore.order.OrderStatus.CANCELLED")
    Optional<BigDecimal> totalRevenue();

    @Query("""
            select case when count(o) > 0 then true else false end
            from CustomerOrder o
            join o.items item
            where o.user.id = :userId
              and o.status = com.webbanpc.shoestore.order.OrderStatus.DELIVERED
              and item.shoeSlug = :shoeSlug
            """)
    boolean existsDeliveredOrderContainingShoe(@Param("userId") Long userId, @Param("shoeSlug") String shoeSlug);
}
