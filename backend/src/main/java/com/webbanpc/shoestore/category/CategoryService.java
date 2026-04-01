package com.webbanpc.shoestore.category;

import java.util.List;
import java.util.Objects;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Category findEntityBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.name())
                .slug(SlugUtils.slugify(request.name()))
                .description(request.description())
                .heroTone(request.heroTone())
                .build();

        Category savedCategory = Objects.requireNonNull(categoryRepository.save(Objects.requireNonNull(category)));
        return toResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse update(@NonNull Long id, CategoryRequest request) {
        Long categoryId = Objects.requireNonNull(id);
        Category category = Objects.requireNonNull(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId)));

        category.setName(request.name());
        category.setSlug(SlugUtils.slugify(request.name()));
        category.setDescription(request.description());
        category.setHeroTone(request.heroTone());

        return toResponse(category);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        Long categoryId = Objects.requireNonNull(id);
        Category category = Objects.requireNonNull(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId)));
        categoryRepository.delete(Objects.requireNonNull(category));
    }

    private CategoryResponse toResponse(@NonNull Category category) {
        return new CategoryResponse(
                Objects.requireNonNull(category.getId()),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getHeroTone());
    }
}
