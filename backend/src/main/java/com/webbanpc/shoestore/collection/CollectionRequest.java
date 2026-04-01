package com.webbanpc.shoestore.collection;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CollectionRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotBlank String featureLabel,
        @NotBlank String heroTone,
        @NotBlank String coverImage,
        boolean active,
        int sortOrder,
        @NotEmpty List<@NotNull Long> shoeIds) {
}
