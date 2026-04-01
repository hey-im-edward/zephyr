package com.webbanpc.shoestore.banner;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/banner-slots")
public class AdminBannerSlotController {

    private final BannerSlotService bannerSlotService;

    public AdminBannerSlotController(BannerSlotService bannerSlotService) {
        this.bannerSlotService = bannerSlotService;
    }

    @GetMapping
    public List<BannerSlotResponse> list() {
        return bannerSlotService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BannerSlotResponse create(@Valid @RequestBody BannerSlotRequest request) {
        return bannerSlotService.create(request);
    }

    @PutMapping("/{id}")
    public BannerSlotResponse update(@PathVariable Long id, @Valid @RequestBody BannerSlotRequest request) {
        return bannerSlotService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bannerSlotService.delete(id);
    }
}
