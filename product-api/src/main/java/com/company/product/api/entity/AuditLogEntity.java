package com.company.product.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "actor_id")
    private UserEntity actor;

    @Column(nullable = false)
    private String entity;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(nullable = false)
    private String action;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public void setActor(UserEntity actor) { this.actor = actor; }
    public void setEntity(String entity) { this.entity = entity; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public void setAction(String action) { this.action = action; }
}
