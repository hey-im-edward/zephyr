package com.webbanpc.shoestore.shipping;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/shipping-methods")
public class AdminShippingMethodController {

    private final ShippingMethodService shippingMethodService;

    public AdminShippingMethodController(ShippingMethodService shippingMethodService) {
        this.shippingMethodService = shippingMethodService;
    }

    @GetMapping
    public List<ShippingMethodResponse> list() {
        return shippingMethodService.listForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShippingMethodResponse create(@Valid @RequestBody ShippingMethodRequest request) {
        return shippingMethodService.create(request);
    }

    @PutMapping("/{id}")
    public ShippingMethodResponse update(@PathVariable Long id, @Valid @RequestBody ShippingMethodRequest request) {
        return shippingMethodService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        shippingMethodService.delete(id);
    }
}
