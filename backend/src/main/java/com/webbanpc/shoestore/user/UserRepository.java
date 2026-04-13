package com.webbanpc.shoestore.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findByAuthProviderAndAuthProviderSubject(AuthProvider authProvider, String authProviderSubject);

    boolean existsByEmail(String email);
}
