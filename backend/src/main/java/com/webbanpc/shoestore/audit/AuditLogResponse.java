package com.webbanpc.shoestore.audit;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String actorName,
        String actionType,
        String resourceType,
        String resourceId,
        String message,
        LocalDateTime createdAt) {
}
