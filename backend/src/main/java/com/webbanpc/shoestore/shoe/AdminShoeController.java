package com.webbanpc.shoestore.shoe;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/shoes")
public class AdminShoeController {

    private final ShoeService shoeService;

    public AdminShoeController(ShoeService shoeService) {
        this.shoeService = shoeService;
    }

    @GetMapping
    public List<ShoeDetailResponse> list() {
        return shoeService.getAllForAdmin();
    }

    @GetMapping("/{id}")
    public ShoeDetailResponse get(@PathVariable @NonNull Long id) {
        return shoeService.getById(Objects.requireNonNull(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoeDetailResponse create(@Valid @RequestBody ShoeRequest request) {
        return shoeService.create(request);
    }

    @PutMapping("/{id}")
    public ShoeDetailResponse update(@PathVariable @NonNull Long id, @Valid @RequestBody ShoeRequest request) {
        return shoeService.update(Objects.requireNonNull(id), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @NonNull Long id) {
        shoeService.delete(Objects.requireNonNull(id));
    }
}
