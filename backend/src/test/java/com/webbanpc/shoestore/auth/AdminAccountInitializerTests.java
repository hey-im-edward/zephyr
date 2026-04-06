package com.webbanpc.shoestore.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.webbanpc.shoestore.config.AdminProperties;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRepository;
import com.webbanpc.shoestore.user.UserRole;

@ExtendWith(MockitoExtension.class)
class AdminAccountInitializerTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminAccountInitializer initializer;

    @BeforeEach
    void setUp() {
        AdminProperties properties = new AdminProperties("admin@zephyr.vn", "StrongAdminPass123!");
        initializer = new AdminAccountInitializer(properties, userRepository, passwordEncoder);
    }

    @Test
    void shouldLeaveExistingAdminAccountUntouched() {
        UserAccount existing = UserAccount.builder()
                .id(1L)
                .fullName("Old Name")
                .email("admin@zephyr.vn")
                .phone("0123456789")
                .passwordHash("old-hash")
                .role(UserRole.USER)
                .active(false)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        when(userRepository.findByEmail("admin@zephyr.vn")).thenReturn(Optional.of(existing));
        initializer.run(new DefaultApplicationArguments(new String[0]));

        assertEquals("Old Name", existing.getFullName());
        assertEquals("0123456789", existing.getPhone());
        assertEquals(UserRole.USER, existing.getRole());
        assertFalse(existing.isActive());
        assertEquals("old-hash", existing.getPasswordHash());
        verify(userRepository).findByEmail("admin@zephyr.vn");
        verify(userRepository, never()).save(existing);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldCreateAdminAccountWhenMissing() {
        when(userRepository.findByEmail("admin@zephyr.vn")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("StrongAdminPass123!")).thenReturn("encoded-pass");

        initializer.run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<UserAccount> accountCaptor = ArgumentCaptor.forClass(UserAccount.class);
        verify(userRepository).save(accountCaptor.capture());

        UserAccount created = accountCaptor.getValue();
        assertEquals("admin@zephyr.vn", created.getEmail());
        assertEquals("ZEPHYR Admin", created.getFullName());
        assertEquals(UserRole.ADMIN, created.getRole());
        assertTrue(created.isActive());
        assertEquals("encoded-pass", created.getPasswordHash());
    }
}
