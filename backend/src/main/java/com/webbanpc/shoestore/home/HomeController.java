package com.webbanpc.shoestore.home;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.banner.BannerSlotService;
import com.webbanpc.shoestore.campaign.CampaignService;
import com.webbanpc.shoestore.category.CategoryService;
import com.webbanpc.shoestore.collection.CollectionService;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;
import com.webbanpc.shoestore.shoe.ShoeService;

@RestController
@RequestMapping("/api/v1/home")
public class HomeController {

    private final CategoryService categoryService;
    private final ShoeService shoeService;
    private final CampaignService campaignService;
    private final BannerSlotService bannerSlotService;
    private final CollectionService collectionService;
    private final PromotionService promotionService;

    public HomeController(
            CategoryService categoryService,
            ShoeService shoeService,
            CampaignService campaignService,
            BannerSlotService bannerSlotService,
            CollectionService collectionService,
            PromotionService promotionService) {
        this.categoryService = categoryService;
        this.shoeService = shoeService;
        this.campaignService = campaignService;
        this.bannerSlotService = bannerSlotService;
        this.collectionService = collectionService;
        this.promotionService = promotionService;
    }

    @GetMapping
    public HomeResponse getHome() {
        return new HomeResponse(
                "Chọn đúng đôi giày cho mỗi chuyển động đáng nhớ.",
                "ZEPHYR tuyển chọn những đôi giày mang sắc độ đương đại, có cấu trúc đẹp và trải nghiệm mua sắm rõ ràng từ catalog đến thanh toán.",
                "ZEPHYR curated selection",
                categoryService.getAll(),
                shoeService.search(null, true, null),
                shoeService.search(null, null, null).stream().filter(ShoeCardResponse::newArrival).toList(),
                campaignService.getFirstActiveByPlacement("HOME_HERO"),
                bannerSlotService.listActive(),
                collectionService.listActive().stream().limit(2).toList(),
                promotionService.getFeaturedPromotion());
    }
}
