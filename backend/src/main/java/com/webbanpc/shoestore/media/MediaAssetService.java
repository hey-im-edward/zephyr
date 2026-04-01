package com.webbanpc.shoestore.media;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.common.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class MediaAssetService {

    private final MediaAssetRepository mediaAssetRepository;

    public MediaAssetService(MediaAssetRepository mediaAssetRepository) {
        this.mediaAssetRepository = mediaAssetRepository;
    }

    public List<MediaAssetResponse> list() {
        return mediaAssetRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MediaAssetResponse create(MediaAssetRequest request) {
        MediaAsset mediaAsset = MediaAsset.builder()
                .name(request.name())
                .mediaKind(request.mediaKind())
                .url(request.url())
                .altText(request.altText())
                .dominantTone(request.dominantTone())
                .tags(request.tags())
                .createdAt(LocalDateTime.now())
                .build();
        return toResponse(mediaAssetRepository.save(mediaAsset));
    }

    @Transactional
    public MediaAssetResponse update(@NonNull Long id, MediaAssetRequest request) {
        MediaAsset mediaAsset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found: " + id));
        mediaAsset.setName(request.name());
        mediaAsset.setMediaKind(request.mediaKind());
        mediaAsset.setUrl(request.url());
        mediaAsset.setAltText(request.altText());
        mediaAsset.setDominantTone(request.dominantTone());
        mediaAsset.setTags(request.tags());
        return toResponse(mediaAsset);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        MediaAsset mediaAsset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found: " + id));
        mediaAssetRepository.delete(mediaAsset);
    }

    private MediaAssetResponse toResponse(MediaAsset mediaAsset) {
        return new MediaAssetResponse(
                mediaAsset.getId(),
                mediaAsset.getName(),
                mediaAsset.getMediaKind(),
                mediaAsset.getUrl(),
                mediaAsset.getAltText(),
                mediaAsset.getDominantTone(),
                mediaAsset.getTags(),
                mediaAsset.getCreatedAt());
    }
}
