package com.webbanpc.shoestore.shipping;

import java.util.List;
import java.util.Objects;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.common.SlugUtils;

@Service
@Transactional(readOnly = true)
public class ShippingMethodService {

    private final ShippingMethodRepository shippingMethodRepository;

    public ShippingMethodService(ShippingMethodRepository shippingMethodRepository) {
        this.shippingMethodRepository = shippingMethodRepository;
    }

    public List<ShippingMethodResponse> listActive() {
        return shippingMethodRepository.findAllByActiveTrueOrderByPriorityAscNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ShippingMethodResponse> listForAdmin() {
        return shippingMethodRepository.findAllByOrderByPriorityAscNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ShippingMethod findEntityBySlug(String slug) {
        return shippingMethodRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping method not found: " + slug));
    }

    @Transactional
    public ShippingMethodResponse create(ShippingMethodRequest request) {
        ShippingMethod shippingMethod = ShippingMethod.builder()
                .name(request.name())
                .slug(SlugUtils.slugify(request.name()))
                .description(request.description())
                .fee(request.fee())
                .etaLabel(request.etaLabel())
                .active(request.active())
                .priority(request.priority())
                .build();

        return toResponse(shippingMethodRepository.save(Objects.requireNonNull(shippingMethod)));
    }

    @Transactional
    public ShippingMethodResponse update(@NonNull Long id, ShippingMethodRequest request) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping method not found: " + id));

        shippingMethod.setName(request.name());
        shippingMethod.setSlug(SlugUtils.slugify(request.name()));
        shippingMethod.setDescription(request.description());
        shippingMethod.setFee(request.fee());
        shippingMethod.setEtaLabel(request.etaLabel());
        shippingMethod.setActive(request.active());
        shippingMethod.setPriority(request.priority());

        return toResponse(shippingMethod);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping method not found: " + id));
        shippingMethodRepository.delete(shippingMethod);
    }

    private ShippingMethodResponse toResponse(ShippingMethod shippingMethod) {
        return new ShippingMethodResponse(
                shippingMethod.getId(),
                shippingMethod.getName(),
                shippingMethod.getSlug(),
                shippingMethod.getDescription(),
                shippingMethod.getFee(),
                shippingMethod.getEtaLabel(),
                shippingMethod.isActive(),
                shippingMethod.getPriority());
    }
}
