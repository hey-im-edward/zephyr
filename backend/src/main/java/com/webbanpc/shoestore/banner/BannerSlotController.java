package com.webbanpc.shoestore.banner;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/banner-slots")
public class BannerSlotController {

    private final BannerSlotService bannerSlotService;

    public BannerSlotController(BannerSlotService bannerSlotService) {
        this.bannerSlotService = bannerSlotService;
    }

    @GetMapping
    public Object list(@RequestParam(required = false) String slotKey) {
        if (slotKey != null && !slotKey.isBlank()) {
            return bannerSlotService.getBySlotKey(slotKey.toUpperCase());
        }
        return bannerSlotService.listActive();
    }
}
