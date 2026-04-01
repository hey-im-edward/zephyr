package com.webbanpc.shoestore.wishlist;

import jakarta.validation.constraints.NotBlank;

public record WishlistRequest(@NotBlank String shoeSlug) {
}
