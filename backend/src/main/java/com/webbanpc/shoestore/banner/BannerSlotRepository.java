package com.webbanpc.shoestore.banner;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BannerSlotRepository extends JpaRepository<BannerSlot, Long> {

    List<BannerSlot> findAllByOrderBySortOrderAscIdAsc();

    List<BannerSlot> findAllByActiveTrueOrderBySortOrderAscIdAsc();

    Optional<BannerSlot> findBySlotKey(String slotKey);
}
