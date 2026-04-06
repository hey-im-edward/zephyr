package com.webbanpc.shoestore.order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = { "items", "user" })
    Optional<CustomerOrder> findWithItemsById(Long id);

    @EntityGraph(attributePaths = { "items", "user" })
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "items", "user" })
    List<CustomerOrder> findAllByUserIdOrderByCreatedAtDesc(Long userId);

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
