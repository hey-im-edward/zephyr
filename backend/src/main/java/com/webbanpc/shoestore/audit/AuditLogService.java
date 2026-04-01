package com.webbanpc.shoestore.audit;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webbanpc.shoestore.user.UserAccount;

@Service
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public List<AuditLogResponse> listRecent() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void record(UserAccount actor, String actionType, String resourceType, String resourceId, String message) {
        auditLogRepository.save(AuditLog.builder()
                .actorUser(actor)
                .actionType(actionType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getActorUser() != null ? auditLog.getActorUser().getFullName() : "System",
                auditLog.getActionType(),
                auditLog.getResourceType(),
                auditLog.getResourceId(),
                auditLog.getMessage(),
                auditLog.getCreatedAt());
    }
}
