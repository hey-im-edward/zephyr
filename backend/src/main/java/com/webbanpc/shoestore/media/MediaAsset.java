package com.webbanpc.shoestore.media;

import java.time.LocalDateTime;

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
@Table(name = "media_assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "media_kind", nullable = false, length = 30)
    private String mediaKind;

    @Column(nullable = false, length = 255)
    private String url;

    @Column(name = "alt_text", nullable = false, length = 255)
    private String altText;

    @Column(name = "dominant_tone", nullable = false, length = 40)
    private String dominantTone;

    @Column(nullable = false, length = 255)
    private String tags;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
