package com.webbanpc.shoestore.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 255) String description,
        @NotBlank @Size(max = 40) String heroTone) {
}
