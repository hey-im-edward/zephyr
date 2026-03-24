package com.webbanpc.shoestore.category;

import java.util.List;

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

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        category.setName(request.name());
        category.setSlug(SlugUtils.slugify(request.name()));
        category.setDescription(request.description());
        category.setHeroTone(request.heroTone());

        return toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getHeroTone());
    }
}
