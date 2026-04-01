package com.webbanpc.shoestore.campaign;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findAllByOrderBySortOrderAscIdAsc();

    List<Campaign> findAllByActiveTrueOrderBySortOrderAscIdAsc();

    Optional<Campaign> findFirstByPlacementAndActiveTrueOrderBySortOrderAscIdAsc(String placement);
}
