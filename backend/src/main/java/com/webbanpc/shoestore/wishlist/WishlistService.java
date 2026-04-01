package com.webbanpc.shoestore.wishlist;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserAccount;

@Service
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ShoeRepository shoeRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository, ShoeRepository shoeRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.shoeRepository = shoeRepository;
    }

    public List<WishlistResponse> listForUser(UserAccount user) {
        return wishlistItemRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public boolean isWishlisted(UserAccount user, String slug) {
        return wishlistItemRepository.existsByUserIdAndShoeSlug(user.getId(), slug);
    }

    @Transactional
    public WishlistResponse add(UserAccount user, WishlistRequest request) {
        return wishlistItemRepository.findByUserIdAndShoeSlug(user.getId(), request.shoeSlug())
                .map(this::toResponse)
                .orElseGet(() -> {
                    Shoe shoe = shoeRepository.findBySlug(request.shoeSlug())
                            .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + request.shoeSlug()));
                    WishlistItem item = WishlistItem.builder()
                            .user(user)
                            .shoe(shoe)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return toResponse(wishlistItemRepository.save(item));
                });
    }

    @Transactional
    public void remove(UserAccount user, String slug) {
        WishlistItem item = wishlistItemRepository.findByUserIdAndShoeSlug(user.getId(), slug)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found for shoe: " + slug));
        wishlistItemRepository.delete(item);
    }

    private WishlistResponse toResponse(WishlistItem item) {
        int totalStock = item.getShoe().getSizeStocks().stream().mapToInt(size -> size.getStockQuantity()).sum();
        return new WishlistResponse(
                item.getId(),
                item.getShoe().getId(),
                item.getShoe().getSlug(),
                item.getShoe().getName(),
                item.getShoe().getBrand(),
                item.getShoe().getSilhouette(),
                item.getShoe().getPrimaryImage(),
                item.getShoe().getPrice(),
                item.getShoe().getCategory().getName(),
                totalStock > 0);
    }
}
