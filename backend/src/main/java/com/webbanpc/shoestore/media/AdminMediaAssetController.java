package com.webbanpc.shoestore.media;

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
@RequestMapping("/api/v1/admin/media-assets")
public class AdminMediaAssetController {

    private final MediaAssetService mediaAssetService;

    public AdminMediaAssetController(MediaAssetService mediaAssetService) {
        this.mediaAssetService = mediaAssetService;
    }

    @GetMapping
    public List<MediaAssetResponse> list() {
        return mediaAssetService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetResponse create(@Valid @RequestBody MediaAssetRequest request) {
        return mediaAssetService.create(request);
    }

    @PutMapping("/{id}")
    public MediaAssetResponse update(@PathVariable Long id, @Valid @RequestBody MediaAssetRequest request) {
        return mediaAssetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        mediaAssetService.delete(id);
    }
}
