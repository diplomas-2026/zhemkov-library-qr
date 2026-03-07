package com.company.product.api.service;

import com.company.product.api.entity.AuditLogEntity;
import com.company.product.api.entity.UserEntity;
import com.company.product.api.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UserEntity actor, String entity, Long entityId, String action) {
        AuditLogEntity log = new AuditLogEntity();
        log.setActor(actor);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setAction(action);
        auditLogRepository.save(log);
    }
}
