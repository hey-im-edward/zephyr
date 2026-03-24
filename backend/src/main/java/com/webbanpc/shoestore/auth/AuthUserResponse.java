package com.webbanpc.shoestore.auth;

import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

public record AuthUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        UserRole role) {

    public static AuthUserResponse from(UserAccount user) {
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole());
    }
}
