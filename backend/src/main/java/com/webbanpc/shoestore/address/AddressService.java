package com.webbanpc.shoestore.address;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.user.UserAccount;

@Service
@Transactional(readOnly = true)
public class AddressService {

    private final UserAddressRepository userAddressRepository;

    public AddressService(UserAddressRepository userAddressRepository) {
        this.userAddressRepository = userAddressRepository;
    }

    public List<AddressResponse> listForUser(UserAccount user) {
        return userAddressRepository.findAllByUserIdOrderByDefaultAddressDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse create(UserAccount user, AddressRequest request) {
        if (request.defaultAddress()) {
            clearDefault(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.label())
                .recipientName(request.recipientName())
                .phone(request.phone())
                .addressLine(request.addressLine())
                .city(request.city())
                .defaultAddress(request.defaultAddress())
                .createdAt(LocalDateTime.now())
                .build();
        return toResponse(userAddressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(@NonNull UserAccount user, @NonNull Long id, AddressRequest request) {
        UserAddress address = userAddressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + id));
        if (request.defaultAddress()) {
            clearDefault(user.getId());
        }
        address.setLabel(request.label());
        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setDefaultAddress(request.defaultAddress());
        return toResponse(address);
    }

    @Transactional
    public void delete(@NonNull UserAccount user, @NonNull Long id) {
        UserAddress address = userAddressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + id));
        userAddressRepository.delete(address);
    }

    private void clearDefault(Long userId) {
        userAddressRepository.findAllByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId)
                .forEach(address -> address.setDefaultAddress(false));
    }

    private AddressResponse toResponse(UserAddress address) {
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getAddressLine(),
                address.getCity(),
                address.isDefaultAddress());
    }
}
