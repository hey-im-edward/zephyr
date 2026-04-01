package com.webbanpc.shoestore.campaign;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;

@Service
@Transactional(readOnly = true)
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public List<CampaignResponse> listActive() {
        return campaignRepository.findAllByActiveTrueOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CampaignResponse> listForAdmin() {
        return campaignRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CampaignResponse getFirstActiveByPlacement(String placement) {
        return campaignRepository.findFirstByPlacementAndActiveTrueOrderBySortOrderAscIdAsc(placement)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public CampaignResponse create(CampaignRequest request) {
        Campaign campaign = Campaign.builder()
                .title(request.title())
                .slug(SlugUtils.slugify(request.title()))
                .placement(request.placement())
                .eyebrow(request.eyebrow())
                .headline(request.headline())
                .description(request.description())
                .ctaLabel(request.ctaLabel())
                .ctaHref(request.ctaHref())
                .backgroundImage(request.backgroundImage())
                .focalImage(request.focalImage())
                .heroTone(request.heroTone())
                .active(request.active())
                .sortOrder(request.sortOrder())
                .build();
        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public CampaignResponse update(@NonNull Long id, CampaignRequest request) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found: " + id));
        campaign.setTitle(request.title());
        campaign.setSlug(SlugUtils.slugify(request.title()));
        campaign.setPlacement(request.placement());
        campaign.setEyebrow(request.eyebrow());
        campaign.setHeadline(request.headline());
        campaign.setDescription(request.description());
        campaign.setCtaLabel(request.ctaLabel());
        campaign.setCtaHref(request.ctaHref());
        campaign.setBackgroundImage(request.backgroundImage());
        campaign.setFocalImage(request.focalImage());
        campaign.setHeroTone(request.heroTone());
        campaign.setActive(request.active());
        campaign.setSortOrder(request.sortOrder());
        return toResponse(campaign);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found: " + id));
        campaignRepository.delete(campaign);
    }

    private CampaignResponse toResponse(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getTitle(),
                campaign.getSlug(),
                campaign.getPlacement(),
                campaign.getEyebrow(),
                campaign.getHeadline(),
                campaign.getDescription(),
                campaign.getCtaLabel(),
                campaign.getCtaHref(),
                campaign.getBackgroundImage(),
                campaign.getFocalImage(),
                campaign.getHeroTone(),
                campaign.isActive(),
                campaign.getSortOrder());
    }
}
