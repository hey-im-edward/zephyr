package com.webbanpc.shoestore.shipping;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {

    List<ShippingMethod> findAllByOrderByPriorityAscNameAsc();

    List<ShippingMethod> findAllByActiveTrueOrderByPriorityAscNameAsc();

    Optional<ShippingMethod> findBySlug(String slug);
}
