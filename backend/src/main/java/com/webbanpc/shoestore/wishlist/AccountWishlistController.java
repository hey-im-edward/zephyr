package com.webbanpc.shoestore.wishlist;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.user.UserAccount;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/account/wishlist")
public class AccountWishlistController {

    private final WishlistService wishlistService;

    public AccountWishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<WishlistResponse> list(@AuthenticationPrincipal UserAccount user) {
        return wishlistService.listForUser(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistResponse add(@AuthenticationPrincipal UserAccount user, @Valid @RequestBody WishlistRequest request) {
        return wishlistService.add(user, request);
    }

    @DeleteMapping("/{shoeSlug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal UserAccount user, @PathVariable String shoeSlug) {
        wishlistService.remove(user, shoeSlug);
    }
}
