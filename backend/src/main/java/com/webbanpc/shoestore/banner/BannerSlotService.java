package com.webbanpc.shoestore.banner;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class BannerSlotService {

    private final BannerSlotRepository bannerSlotRepository;

    public BannerSlotService(BannerSlotRepository bannerSlotRepository) {
        this.bannerSlotRepository = bannerSlotRepository;
    }

    public List<BannerSlotResponse> listActive() {
        return bannerSlotRepository.findAllByActiveTrueOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BannerSlotResponse> listForAdmin() {
        return bannerSlotRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BannerSlotResponse getBySlotKey(String slotKey) {
        return bannerSlotRepository.findBySlotKey(slotKey)
                .filter(BannerSlot::isActive)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public BannerSlotResponse create(BannerSlotRequest request) {
        BannerSlot bannerSlot = BannerSlot.builder()
                .slotKey(request.slotKey().trim().toUpperCase())
                .badge(request.badge())
                .title(request.title())
                .description(request.description())
                .ctaLabel(request.ctaLabel())
                .ctaHref(request.ctaHref())
                .imageUrl(request.imageUrl())
                .tone(request.tone())
                .active(request.active())
                .sortOrder(request.sortOrder())
                .build();
        return toResponse(bannerSlotRepository.save(bannerSlot));
    }

    @Transactional
    public BannerSlotResponse update(@NonNull Long id, BannerSlotRequest request) {
        BannerSlot bannerSlot = bannerSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner slot not found: " + id));
        bannerSlot.setSlotKey(request.slotKey().trim().toUpperCase());
        bannerSlot.setBadge(request.badge());
        bannerSlot.setTitle(request.title());
        bannerSlot.setDescription(request.description());
        bannerSlot.setCtaLabel(request.ctaLabel());
        bannerSlot.setCtaHref(request.ctaHref());
        bannerSlot.setImageUrl(request.imageUrl());
        bannerSlot.setTone(request.tone());
        bannerSlot.setActive(request.active());
        bannerSlot.setSortOrder(request.sortOrder());
        return toResponse(bannerSlot);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        BannerSlot bannerSlot = bannerSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner slot not found: " + id));
        bannerSlotRepository.delete(bannerSlot);
    }

    private BannerSlotResponse toResponse(BannerSlot bannerSlot) {
        return new BannerSlotResponse(
                bannerSlot.getId(),
                bannerSlot.getSlotKey(),
                bannerSlot.getBadge(),
                bannerSlot.getTitle(),
                bannerSlot.getDescription(),
                bannerSlot.getCtaLabel(),
                bannerSlot.getCtaHref(),
                bannerSlot.getImageUrl(),
                bannerSlot.getTone(),
                bannerSlot.isActive(),
                bannerSlot.getSortOrder());
    }
}
