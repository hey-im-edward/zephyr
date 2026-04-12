package com.webbanpc.shoestore.order;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.BadRequestException;
import com.webbanpc.shoestore.common.ResourceNotFoundException;
import com.webbanpc.shoestore.payment.PaymentService;
import com.webbanpc.shoestore.promotion.Promotion;
import com.webbanpc.shoestore.promotion.PromotionService;
import com.webbanpc.shoestore.shoe.Shoe;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.shoe.ShoeSizeStock;
import com.webbanpc.shoestore.shoe.ShoeSizeStockRepository;
import com.webbanpc.shoestore.shipping.ShippingMethod;
import com.webbanpc.shoestore.shipping.ShippingMethodService;
import com.webbanpc.shoestore.user.UserAccount;
import com.webbanpc.shoestore.user.UserRole;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private static final int MAX_ORDER_PAGE_SIZE = 50;

    private final CustomerOrderRepository customerOrderRepository;
    private final ShoeRepository shoeRepository;
    private final ShoeSizeStockRepository shoeSizeStockRepository;
    private final ShippingMethodService shippingMethodService;
    private final PromotionService promotionService;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentService paymentService;

    public OrderService(
            CustomerOrderRepository customerOrderRepository,
            ShoeRepository shoeRepository,
            ShoeSizeStockRepository shoeSizeStockRepository,
            ShippingMethodService shippingMethodService,
            PromotionService promotionService,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            PaymentService paymentService) {
        this.customerOrderRepository = customerOrderRepository;
        this.shoeRepository = shoeRepository;
        this.shoeSizeStockRepository = shoeSizeStockRepository;
        this.shippingMethodService = shippingMethodService;
        this.promotionService = promotionService;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    public OrderResponse create(UserAccount user, OrderRequest request) {
        if (user != null && user.getRole() == UserRole.ADMIN) {
            throw new AccessDeniedException("Admin accounts are not allowed to place orders");
        }

        ShippingMethod shippingMethod = request.shippingMethodSlug() != null && !request.shippingMethodSlug().isBlank()
                ? shippingMethodService.findEntityBySlug(request.shippingMethodSlug())
                : null;
        Promotion promotion = request.promotionCode() != null && !request.promotionCode().isBlank()
                ? promotionService.findEntityByCode(request.promotionCode().trim().toUpperCase())
                : null;

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
                .shippingMethod(shippingMethod)
                .promotion(promotion)
                .totalAmount(BigDecimal.ZERO)
                .shippingFee(shippingMethod != null ? shippingMethod.getFee() : BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .deliveryWindow(shippingMethod != null ? shippingMethod.getEtaLabel() : null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest item : request.items().stream().sorted(orderItemRequestComparator()).toList()) {
            ShoeSizeStock sizeStock = findSizeStockForUpdateOrThrow(
                    item.shoeSlug(),
                    item.sizeLabel(),
                    "Selected size is not available: " + item.sizeLabel());
            Shoe shoe = sizeStock.getShoe();

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

        BigDecimal discountAmount = promotion != null
                ? totalAmount.multiply(BigDecimal.valueOf(0.08)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount.add(order.getShippingFee()).subtract(discountAmount));
        CustomerOrder savedOrder = customerOrderRepository.save(order);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.PENDING)
                .note("Order created")
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(savedOrder);
    }

    public OrderListResponse listForUser(UserAccount user, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), MAX_ORDER_PAGE_SIZE);
        Page<CustomerOrder> orderPage = customerOrderRepository.findAllByUserId(
                user.getId(),
                PageRequest.of(safePage - 1, safePageSize, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));

        return toListResponse(orderPage, safePage, safePageSize);
    }

    public OrderDetailResponse getForUser(UserAccount user, Long id) {
        CustomerOrder order = customerOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found: " + id);
        }

        return toDetailResponse(order);
    }

    public OrderListResponse listForAdmin(OrderStatus status, String query, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), MAX_ORDER_PAGE_SIZE);
        String normalizedQuery = query == null ? null : query.trim();
        if (normalizedQuery != null && normalizedQuery.isBlank()) {
            normalizedQuery = null;
        }

        Page<CustomerOrder> orderPage = customerOrderRepository.findAllForAdmin(
                status,
                normalizedQuery,
                PageRequest.of(safePage - 1, safePageSize, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));

        return toListResponse(orderPage, safePage, safePageSize);
    }

    public OrderDetailResponse getForAdmin(Long id) {
        return toDetailResponse(customerOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    @Transactional
    public OrderDetailResponse updateStatus(Long id, OrderStatus nextStatus) {
        CustomerOrder order = customerOrderRepository.findWithItemsByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (requiresPaymentSettlement(nextStatus) && !paymentService.isOrderPaymentSettled(order)) {
            throw new BadRequestException("Online payment has not been confirmed for this order.");
        }

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
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(nextStatus)
                .note("Status updated from " + previousStatus + " to " + nextStatus)
                .createdAt(LocalDateTime.now())
                .build());
        return toDetailResponse(order);
    }

    private String generateOrderCode() {
        int suffix = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "SH-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now()) + "-" + suffix;
    }

    private void restock(CustomerOrder order) {
        order.getItems().stream()
                .sorted(orderItemComparator())
                .forEach(item -> {
                    ShoeSizeStock sizeStock = findSizeStockForUpdateOrThrow(
                            item.getShoeSlug(),
                            item.getSizeLabel(),
                            "Size not found while restoring stock for " + item.getShoeName());
                    sizeStock.setStockQuantity(sizeStock.getStockQuantity() + item.getQuantity());
                });
    }

    private void deductStock(CustomerOrder order) {
        for (OrderItem item : order.getItems().stream().sorted(orderItemComparator()).toList()) {
            ShoeSizeStock sizeStock = findSizeStockForUpdateOrThrow(
                    item.getShoeSlug(),
                    item.getSizeLabel(),
                    "Size not found for " + item.getShoeName());

            if (sizeStock.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Cannot restore order from cancelled state because stock is no longer available");
            }

            sizeStock.setStockQuantity(sizeStock.getStockQuantity() - item.getQuantity());
        }
    }

    private ShoeSizeStock findSizeStockForUpdateOrThrow(String shoeSlug, String sizeLabel, String missingSizeMessage) {
        return shoeSizeStockRepository.findByShoeSlugAndSizeLabelForUpdate(shoeSlug, sizeLabel)
                .orElseThrow(() -> {
                    if (shoeRepository.findBySlug(shoeSlug).isEmpty()) {
                        return new ResourceNotFoundException("Shoe not found: " + shoeSlug);
                    }
                    return new BadRequestException(missingSizeMessage);
                });
    }

    private Comparator<OrderItemRequest> orderItemRequestComparator() {
        return Comparator.comparing(OrderItemRequest::shoeSlug)
                .thenComparing(OrderItemRequest::sizeLabel, String.CASE_INSENSITIVE_ORDER);
    }

    private Comparator<OrderItem> orderItemComparator() {
        return Comparator.comparing(OrderItem::getShoeSlug)
                .thenComparing(OrderItem::getSizeLabel, String.CASE_INSENSITIVE_ORDER);
    }

    private boolean requiresPaymentSettlement(OrderStatus status) {
        return status == OrderStatus.CONFIRMED
                || status == OrderStatus.PACKING
                || status == OrderStatus.SHIPPING
                || status == OrderStatus.DELIVERED;
    }

    private OrderListResponse toListResponse(Page<CustomerOrder> orderPage, int page, int pageSize) {
        return new OrderListResponse(
                orderPage.getContent().stream().map(this::toResponse).toList(),
                new OrderListResponse.OrderPagination(
                        page,
                        pageSize,
                        orderPage.getTotalElements(),
                        Math.max(1, orderPage.getTotalPages())));
    }

    private OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getEmail(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getShippingMethod() != null ? order.getShippingMethod().getName() : null,
                order.getPromotion() != null ? order.getPromotion().getCode() : null,
                order.getTotalAmount(),
                order.getShippingFee(),
                order.getDiscountAmount(),
                order.getDeliveryWindow(),
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
                order.getShippingMethod() != null ? order.getShippingMethod().getName() : null,
                order.getPromotion() != null ? order.getPromotion().getCode() : null,
                order.getShippingFee(),
                order.getDiscountAmount(),
                order.getDeliveryWindow(),
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
