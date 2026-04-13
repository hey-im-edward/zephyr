package com.webbanpc.shoestore.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.webbanpc.shoestore.auth.JwtAuthenticationFilter;
import com.webbanpc.shoestore.auth.JwtProperties;
import com.webbanpc.shoestore.auth.GoogleAuthProperties;
import com.webbanpc.shoestore.auth.RefreshCookieProperties;
import com.webbanpc.shoestore.chatbot.ChatbotProperties;
import com.webbanpc.shoestore.payment.PaymentOnlineProperties;
import com.webbanpc.shoestore.payment.VNPayProperties;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties({
    AdminProperties.class,
    JwtProperties.class,
    GoogleAuthProperties.class,
    RefreshCookieProperties.class,
    PaymentOnlineProperties.class,
    VNPayProperties.class,
    ChatbotProperties.class })
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);
    private static final int SECURITY_LOG_MESSAGE_LIMIT = 200;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auth/me", "/api/v1/auth/change-password").authenticated()
                        .requestMatchers("/api/v1/account/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/shoes/*/reviews").hasRole("USER")
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/chatbot/completions").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/sessions", "/api/v1/payments/mock/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/sessions/status", "/api/v1/payments/vnpay/return", "/api/v1/payments/vnpay/ipn").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/google", "/api/v1/auth/refresh", "/api/v1/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/orders").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/home", "/api/v1/categories", "/api/v1/shoes/**", "/api/v1/catalog", "/api/v1/campaigns", "/api/v1/banner-slots", "/api/v1/collections/**", "/api/v1/promotions", "/api/v1/shipping-methods").permitAll()
                        .anyRequest().denyAll());
        http.exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint((request, response, authException) -> {
                    LOGGER.warn(
                            "SECURITY_AUTH_FAILURE method={} path={} remoteAddr={} reason={}",
                            request.getMethod(),
                            request.getRequestURI(),
                            request.getRemoteAddr(),
                            sanitizeLogMessage(authException.getMessage()));
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    String principal = authentication != null ? authentication.getName() : "anonymous";
                    LOGGER.warn(
                            "SECURITY_AUTHZ_DENIED method={} path={} principal={} remoteAddr={} reason={}",
                            request.getMethod(),
                            request.getRequestURI(),
                            principal,
                            request.getRemoteAddr(),
                            sanitizeLogMessage(accessDeniedException.getMessage()));
                    response.sendError(HttpServletResponse.SC_FORBIDDEN);
                }));
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static String sanitizeLogMessage(String rawMessage) {
        if (rawMessage == null || rawMessage.isBlank()) {
            return "n/a";
        }

        String normalized = rawMessage.replace('\r', ' ').replace('\n', ' ').trim();
        if (normalized.length() <= SECURITY_LOG_MESSAGE_LIMIT) {
            return normalized;
        }

        return normalized.substring(0, SECURITY_LOG_MESSAGE_LIMIT);
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
