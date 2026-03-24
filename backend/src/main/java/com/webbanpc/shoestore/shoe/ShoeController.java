package com.webbanpc.shoestore.shoe;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shoes")
public class ShoeController {

    private final ShoeService shoeService;

    public ShoeController(ShoeService shoeService) {
        this.shoeService = shoeService;
    }

    @GetMapping
    public List<ShoeCardResponse> getShoes(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String query) {
        return shoeService.search(category, featured, query);
    }

    @GetMapping("/{slug}")
    public ShoeDetailResponse getShoe(@PathVariable String slug) {
        return shoeService.getBySlug(slug);
    }
}
