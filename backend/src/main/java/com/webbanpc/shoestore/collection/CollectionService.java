package com.webbanpc.shoestore.collection;

import java.util.Comparator;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;

@Service
@Transactional(readOnly = true)
public class CollectionService {

    private final MerchCollectionRepository merchCollectionRepository;
    private final ShoeRepository shoeRepository;

    public CollectionService(MerchCollectionRepository merchCollectionRepository, ShoeRepository shoeRepository) {
        this.merchCollectionRepository = merchCollectionRepository;
        this.shoeRepository = shoeRepository;
    }

    public List<CollectionResponse> listActive() {
        return merchCollectionRepository.findAllByActiveTrueOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CollectionResponse> listForAdmin() {
        return merchCollectionRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CollectionResponse getBySlug(String slug) {
        return merchCollectionRepository.findBySlug(slug)
                .filter(MerchCollection::isActive)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found: " + slug));
    }

    @Transactional
    public CollectionResponse create(CollectionRequest request) {
        MerchCollection collection = MerchCollection.builder()
                .name(request.name())
                .slug(SlugUtils.slugify(request.name()))
                .description(request.description())
                .featureLabel(request.featureLabel())
                .heroTone(request.heroTone())
                .coverImage(request.coverImage())
                .active(request.active())
                .sortOrder(request.sortOrder())
                .build();
        syncItems(collection, request.shoeIds());
        return toResponse(merchCollectionRepository.save(collection));
    }

    @Transactional
    public CollectionResponse update(@NonNull Long id, CollectionRequest request) {
        MerchCollection collection = merchCollectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found: " + id));
        collection.setName(request.name());
        collection.setSlug(SlugUtils.slugify(request.name()));
        collection.setDescription(request.description());
        collection.setFeatureLabel(request.featureLabel());
        collection.setHeroTone(request.heroTone());
        collection.setCoverImage(request.coverImage());
        collection.setActive(request.active());
        collection.setSortOrder(request.sortOrder());
        syncItems(collection, request.shoeIds());
        return toResponse(collection);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        MerchCollection collection = merchCollectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found: " + id));
        merchCollectionRepository.delete(collection);
    }

    private void syncItems(MerchCollection collection, List<Long> shoeIds) {
        collection.getItems().clear();
        for (int index = 0; index < shoeIds.size(); index++) {
            Long shoeId = shoeIds.get(index);
            Shoe shoe = shoeRepository.findWithDetailsById(shoeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + shoeId));
            collection.getItems().add(CollectionItem.builder()
                    .collection(collection)
                    .shoe(shoe)
                    .sortOrder(index + 1)
                    .build());
        }
    }

    private CollectionResponse toResponse(MerchCollection collection) {
        return new CollectionResponse(
                collection.getId(),
                collection.getName(),
                collection.getSlug(),
                collection.getDescription(),
                collection.getFeatureLabel(),
                collection.getHeroTone(),
                collection.getCoverImage(),
                collection.isActive(),
                collection.getSortOrder(),
                collection.getItems().stream()
                        .sorted(Comparator.comparing(CollectionItem::getSortOrder).thenComparing(CollectionItem::getId))
                        .map(item -> new CollectionResponse.CollectionShoeResponse(
                                item.getShoe().getId(),
                                item.getShoe().getName(),
                                item.getShoe().getSlug(),
                                item.getShoe().getBrand(),
                                item.getShoe().getSilhouette(),
                                item.getShoe().getShortDescription(),
                                item.getShoe().getPrice(),
                                item.getShoe().getPrimaryImage(),
                                item.getShoe().getCategory().getName()))
                        .toList());
    }
}
