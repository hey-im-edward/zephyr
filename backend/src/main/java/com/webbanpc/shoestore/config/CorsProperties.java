package com.webbanpc.shoestore.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(@DefaultValue("http://localhost:3000") List<String> allowedOrigins) {

    public CorsProperties {
        List<String> source = allowedOrigins == null ? List.of("http://localhost:3000") : allowedOrigins;
        allowedOrigins = source.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        if (allowedOrigins.isEmpty()) {
            allowedOrigins = List.of("http://localhost:3000");
        }
    }
}
