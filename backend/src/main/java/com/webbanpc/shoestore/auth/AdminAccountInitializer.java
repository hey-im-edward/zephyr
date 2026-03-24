package com.webbanpc.shoestore.auth;

import java.time.LocalDateTime;

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
        userRepository.findByEmail(adminProperties.username())
                .ifPresentOrElse(this::refreshAdminAccount, this::createAdminAccount);
    }

    private void refreshAdminAccount(UserAccount adminAccount) {
        adminAccount.setFullName("ZEPHYR Admin");
        adminAccount.setPhone("0900000000");
        adminAccount.setRole(UserRole.ADMIN);
        adminAccount.setActive(true);
        adminAccount.setPasswordHash(passwordEncoder.encode(adminProperties.password()));
    }

    private void createAdminAccount() {
        userRepository.save(UserAccount.builder()
                .fullName("ZEPHYR Admin")
                .email(adminProperties.username())
                .phone("0900000000")
                .passwordHash(passwordEncoder.encode(adminProperties.password()))
                .role(UserRole.ADMIN)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());
    }
}
