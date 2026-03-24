package com.webbanpc.shoestore.home;

import java.util.List;

import com.webbanpc.shoestore.category.CategoryResponse;
import com.webbanpc.shoestore.shoe.ShoeCardResponse;

public record HomeResponse(
        String headline,
        String subheadline,
        String spotlightLabel,
        List<CategoryResponse> categories,
        List<ShoeCardResponse> featured,
        List<ShoeCardResponse> newArrivals) {
}
