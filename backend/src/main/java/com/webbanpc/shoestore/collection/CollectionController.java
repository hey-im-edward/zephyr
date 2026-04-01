package com.webbanpc.shoestore.collection;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public List<CollectionResponse> list() {
        return collectionService.listActive();
    }

    @GetMapping("/{slug}")
    public CollectionResponse getBySlug(@PathVariable String slug) {
        return collectionService.getBySlug(slug);
    }
}
