package com.webbanpc.shoestore.common;

import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtils {

    private SlugUtils() {
    }

    public static String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "item" : normalized;
    }
}
