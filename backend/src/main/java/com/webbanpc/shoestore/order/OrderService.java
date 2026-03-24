package com.webbanpc.shoestore.order;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.shoe.ShoeSizeStock;
import com.webbanpc.shoestore.user.UserAccount;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ShoeRepository shoeRepository;

    public OrderService(CustomerOrderRepository customerOrderRepository, ShoeRepository shoeRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.shoeRepository = shoeRepository;
    }

    @Transactional
    public OrderResponse create(UserAccount user, OrderRequest request) {
        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .orderCode(generateOrderCode())
                .customerName(request.customerName())
                .email(request.email())
                .phone(request.phone())
                .addressLine(request.addressLine())
                .city(request.city())
                .notes(request.notes())
                .status(OrderStatus.PENDING)
                .paymentMethod(request.paymentMethod() == null ? PaymentMethod.COD : request.paymentMethod())
                .totalAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest item : request.items()) {
            Shoe shoe = shoeRepository.findBySlug(item.shoeSlug())
                    .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + item.shoeSlug()));

            ShoeSizeStock sizeStock = shoe.getSizeStocks().stream()
                    .filter(size -> size.getSizeLabel().equalsIgnoreCase(item.sizeLabel()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Selected size is not available: " + item.sizeLabel()));

            if (sizeStock.getStockQuantity() < item.quantity()) {
                throw new BadRequestException("Not enough stock for " + shoe.getName() + " size " + item.sizeLabel());
            }

            sizeStock.setStockQuantity(sizeStock.getStockQuantity() - item.quantity());
            totalAmount = totalAmount.add(shoe.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .shoeSlug(shoe.getSlug())
                    .shoeName(shoe.getName())
                    .sizeLabel(sizeStock.getSizeLabel())
                    .price(shoe.getPrice())
                    .quantity(item.quantity())
                    .build());
        }

        order.setTotalAmount(totalAmount);
        CustomerOrder savedOrder = customerOrderRepository.save(order);
        return toResponse(savedOrder);
    }

    public List<OrderResponse> listForUser(UserAccount user) {
        return customerOrderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderDetailResponse getForUser(UserAccount user, Long id) {
        CustomerOrder order = customerOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found: " + id);
        }

        return toDetailResponse(order);
    }

    public List<OrderResponse> listForAdmin(OrderStatus status, String query) {
        String normalizedQuery = query == null ? null : query.trim().toLowerCase();
        return customerOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(order -> status == null || order.getStatus() == status)
                .filter(order -> normalizedQuery == null || normalizedQuery.isBlank()
                        || order.getOrderCode().toLowerCase().contains(normalizedQuery)
                        || order.getCustomerName().toLowerCase().contains(normalizedQuery)
                        || order.getEmail().toLowerCase().contains(normalizedQuery))
                .map(this::toResponse)
                .toList();
    }

    public OrderDetailResponse getForAdmin(Long id) {
        return toDetailResponse(customerOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    @Transactional
    public OrderDetailResponse updateStatus(Long id, OrderStatus nextStatus) {
        CustomerOrder order = customerOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        OrderStatus previousStatus = order.getStatus();
        if (previousStatus == nextStatus) {
            return toDetailResponse(order);
        }

        if (previousStatus != OrderStatus.CANCELLED && nextStatus == OrderStatus.CANCELLED) {
            restock(order);
        }

        if (previousStatus == OrderStatus.CANCELLED && nextStatus != OrderStatus.CANCELLED) {
            deductStock(order);
        }

        order.setStatus(nextStatus);
        order.setUpdatedAt(LocalDateTime.now());
        return toDetailResponse(order);
    }

    private String generateOrderCode() {
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "SH-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now()) + "-" + suffix;
    }

    private void restock(CustomerOrder order) {
        order.getItems().forEach(item -> shoeRepository.findBySlug(item.getShoeSlug())
                .flatMap(shoe -> shoe.getSizeStocks().stream()
                        .filter(size -> size.getSizeLabel().equalsIgnoreCase(item.getSizeLabel()))
                        .findFirst())
                .ifPresent(sizeStock -> sizeStock.setStockQuantity(sizeStock.getStockQuantity() + item.getQuantity())));
    }

    private void deductStock(CustomerOrder order) {
        for (OrderItem item : order.getItems()) {
            Shoe shoe = shoeRepository.findBySlug(item.getShoeSlug())
                    .orElseThrow(() -> new ResourceNotFoundException("Shoe not found: " + item.getShoeSlug()));

            ShoeSizeStock sizeStock = shoe.getSizeStocks().stream()
                    .filter(size -> size.getSizeLabel().equalsIgnoreCase(item.getSizeLabel()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Size not found for " + item.getShoeName()));

            if (sizeStock.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Cannot restore order from cancelled state because stock is no longer available");
            }

            sizeStock.setStockQuantity(sizeStock.getStockQuantity() - item.getQuantity());
        }
    }

    private OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getEmail(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getCreatedAt());
    }

    private OrderDetailResponse toDetailResponse(CustomerOrder order) {
        return new OrderDetailResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getEmail(),
                order.getPhone(),
                order.getAddressLine(),
                order.getCity(),
                order.getNotes(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream()
                        .sorted(Comparator.comparing(OrderItem::getId))
                        .map(item -> new OrderItemResponse(
                                item.getShoeSlug(),
                                item.getShoeName(),
                                item.getSizeLabel(),
                                item.getPrice(),
                                item.getQuantity(),
                                item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                        .toList());
    }
}
