package com.webbanpc.shoestore.campaign;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public Object list(@RequestParam(required = false) String placement) {
        if (placement != null && !placement.isBlank()) {
            return campaignService.getFirstActiveByPlacement(placement);
        }
        return campaignService.listActive();
    }
}
