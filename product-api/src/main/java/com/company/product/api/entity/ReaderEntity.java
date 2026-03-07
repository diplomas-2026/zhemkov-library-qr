package com.company.product.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "readers")
public class ReaderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false)
    private ReaderRoleType roleType;
    @Column(name = "class_name")
    private String className;
    private String contact;
    @Column(name = "qr_code", nullable = false, unique = true)
    private String qrCode;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public ReaderRoleType getRoleType() { return roleType; }
    public void setRoleType(ReaderRoleType roleType) { this.roleType = roleType; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
}
