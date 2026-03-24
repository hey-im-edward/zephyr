package com.webbanpc.shoestore.admin;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webbanpc.shoestore.category.CategoryRepository;
import com.webbanpc.shoestore.order.CustomerOrderRepository;
import com.webbanpc.shoestore.order.OrderStatus;
import com.webbanpc.shoestore.shoe.ShoeRepository;
import com.webbanpc.shoestore.user.UserRepository;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final CategoryRepository categoryRepository;
    private final ShoeRepository shoeRepository;
    private final UserRepository userRepository;
    private final CustomerOrderRepository customerOrderRepository;

    public AdminDashboardController(
            CategoryRepository categoryRepository,
            ShoeRepository shoeRepository,
            UserRepository userRepository,
            CustomerOrderRepository customerOrderRepository) {
        this.categoryRepository = categoryRepository;
        this.shoeRepository = shoeRepository;
        this.userRepository = userRepository;
        this.customerOrderRepository = customerOrderRepository;
    }

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        return new AdminDashboardResponse(
                categoryRepository.count(),
                shoeRepository.count(),
                userRepository.count(),
                customerOrderRepository.count(),
                customerOrderRepository.countByStatus(OrderStatus.PENDING),
                customerOrderRepository.totalRevenue().orElse(BigDecimal.ZERO));
    }
}
