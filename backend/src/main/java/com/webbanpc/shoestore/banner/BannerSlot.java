package com.webbanpc.shoestore.banner;

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
@Table(name = "banner_slots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_key", nullable = false, unique = true, length = 80)
    private String slotKey;

    @Column(nullable = false, length = 80)
    private String badge;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "cta_label", nullable = false, length = 80)
    private String ctaLabel;

    @Column(name = "cta_href", nullable = false, length = 255)
    private String ctaHref;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(nullable = false, length = 40)
    private String tone;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}
