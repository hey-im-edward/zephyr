package com.webbanpc.shoestore.shoe;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.webbanpc.shoestore.category.Category;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shoes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shoe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(nullable = false, length = 80)
    private String silhouette;

    @Column(name = "short_description", nullable = false, length = 255)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "primary_image", nullable = false, length = 255)
    private String primaryImage;

    @Column(name = "secondary_image", nullable = false, length = 255)
    private String secondaryImage;

    @Column(name = "available_sizes", nullable = false, length = 120)
    private String availableSizes;

    @Column(name = "accent_colors", nullable = false, length = 255)
    private String accentColors;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String highlights;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "new_arrival", nullable = false)
    private boolean newArrival;

    @Column(name = "best_seller", nullable = false)
    private boolean bestSeller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Builder.Default
    @OneToMany(mappedBy = "shoe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sizeLabel asc")
    private List<ShoeSizeStock> sizeStocks = new ArrayList<>();
}
