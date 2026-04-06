package com.webbanpc.shoestore.wishlist;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class WishlistServiceAuthorizationTests {

    @Mock
    private WishlistItemRepository wishlistItemRepository;

    @Mock
    private ShoeRepository shoeRepository;

    private WishlistService wishlistService;

    @BeforeEach
    void setUp() {
        wishlistService = new WishlistService(wishlistItemRepository, shoeRepository);
    }

    @Test
    void shouldRejectAdminWhenListingWishlist() {
        UserAccount admin = account(100L, UserRole.ADMIN);

        assertThrows(AccessDeniedException.class, () -> wishlistService.listForUser(admin));
        verifyNoInteractions(wishlistItemRepository, shoeRepository);
    }

    @Test
    void shouldRejectAdminWhenCheckingWishlistedState() {
        UserAccount admin = account(100L, UserRole.ADMIN);

        assertThrows(AccessDeniedException.class, () -> wishlistService.isWishlisted(admin, "shoe-1"));
        verifyNoInteractions(wishlistItemRepository, shoeRepository);
    }

    @Test
    void shouldRejectAdminWhenAddingWishlistItem() {
        UserAccount admin = account(100L, UserRole.ADMIN);

        assertThrows(AccessDeniedException.class, () -> wishlistService.add(admin, new WishlistRequest("shoe-1")));
        verifyNoInteractions(wishlistItemRepository, shoeRepository);
    }

    @Test
    void shouldRejectAdminWhenRemovingWishlistItem() {
        UserAccount admin = account(100L, UserRole.ADMIN);

        assertThrows(AccessDeniedException.class, () -> wishlistService.remove(admin, "shoe-1"));
        verifyNoInteractions(wishlistItemRepository, shoeRepository);
    }

    @Test
    void shouldAllowRegularUserToCheckWishlistedState() {
        UserAccount shopper = account(101L, UserRole.USER);
        when(wishlistItemRepository.existsByUserIdAndShoeSlug(101L, "shoe-1")).thenReturn(true);

        assertTrue(wishlistService.isWishlisted(shopper, "shoe-1"));
    }

    private UserAccount account(Long id, UserRole role) {
        return UserAccount.builder()
                .id(id)
                .email("user" + id + "@zephyr.vn")
                .role(role)
                .active(true)
                .build();
    }
}