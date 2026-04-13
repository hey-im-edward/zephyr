package com.webbanpc.shoestore.auth;

public record GoogleIdentity(
        String subject,
        String email,
        String fullName) {
}