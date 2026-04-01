package com.webbanpc.shoestore.campaign;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 40)
    private String placement;

    @Column(nullable = false, length = 80)
    private String eyebrow;

    @Column(nullable = false, length = 180)
    private String headline;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "cta_label", nullable = false, length = 80)
    private String ctaLabel;

    @Column(name = "cta_href", nullable = false, length = 255)
    private String ctaHref;

    @Column(name = "background_image", nullable = false, length = 255)
    private String backgroundImage;

    @Column(name = "focal_image", nullable = false, length = 255)
    private String focalImage;

    @Column(name = "hero_tone", nullable = false, length = 40)
    private String heroTone;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
