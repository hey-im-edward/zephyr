package com.webbanpc.shoestore.auth;

import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.webbanpc.shoestore.config.AdminProperties;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private final AdminProperties adminProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountInitializer(
            AdminProperties adminProperties,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.adminProperties = adminProperties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String normalizedUsername = adminProperties.username().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedUsername).isEmpty()) {
            createAdminAccount(normalizedUsername);
        }
    }

    private void createAdminAccount(String email) {
        UserAccount adminAccount = UserAccount.builder()
                .fullName("ZEPHYR Admin")
                .email(email)
                .phone("0900000000")
                .passwordHash(passwordEncoder.encode(adminProperties.password()))
                .role(UserRole.ADMIN)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(Objects.requireNonNull(adminAccount));
    }
}
