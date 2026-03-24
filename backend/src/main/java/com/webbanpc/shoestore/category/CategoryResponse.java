package com.webbanpc.shoestore.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String heroTone) {
}
