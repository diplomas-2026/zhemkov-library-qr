package com.company.product.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
public class LoanEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "copy_id")
    private BookCopyEntity copy;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reader_id")
    private ReaderEntity reader;

    @ManyToOne(optional = false)
    @JoinColumn(name = "issued_by")
    private UserEntity issuedBy;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status;

    public Long getId() { return id; }
    public BookCopyEntity getCopy() { return copy; }
    public void setCopy(BookCopyEntity copy) { this.copy = copy; }
    public ReaderEntity getReader() { return reader; }
    public void setReader(ReaderEntity reader) { this.reader = reader; }
    public UserEntity getIssuedBy() { return issuedBy; }
    public void setIssuedBy(UserEntity issuedBy) { this.issuedBy = issuedBy; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }
    public LocalDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }
    public LoanStatus getStatus() { return status; }
    public void setStatus(LoanStatus status) { this.status = status; }
}
