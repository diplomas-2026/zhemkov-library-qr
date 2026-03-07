package com.company.product.api.service;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.dto.ReaderDtos;
import com.company.product.api.entity.ReaderEntity;
import com.company.product.api.repository.ReaderRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReaderService {
    private final ReaderRepository readerRepository;
    private final LoanService loanService;

    public ReaderService(ReaderRepository readerRepository, LoanService loanService) {
        this.readerRepository = readerRepository;
        this.loanService = loanService;
    }

    public List<ReaderDtos.ReaderResponse> list() {
        return readerRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReaderDtos.ReaderResponse create(ReaderDtos.ReaderRequest request) {
        ReaderEntity entity = new ReaderEntity();
        patch(entity, request);
        return toResponse(readerRepository.save(entity));
    }

    @Transactional
    public ReaderDtos.ReaderResponse update(Long id, ReaderDtos.ReaderRequest request) {
        ReaderEntity entity = readerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Читатель не найден"));
        patch(entity, request);
        return toResponse(readerRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        readerRepository.deleteById(id);
    }

    public ReaderDtos.ReaderQrLookupResponse byQr(String qrCode) {
        ReaderEntity reader = readerRepository.findByQrCode(qrCode).orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
        List<LoanDtos.LoanResponse> loans = loanService.listByReader(reader.getId());
        return new ReaderDtos.ReaderQrLookupResponse(toResponse(reader), loans);
    }

    private void patch(ReaderEntity entity, ReaderDtos.ReaderRequest request) {
        entity.setFullName(request.fullName());
        entity.setRoleType(request.roleType());
        entity.setClassName(request.className());
        entity.setContact(request.contact());
        entity.setQrCode(request.qrCode());
    }

    private ReaderDtos.ReaderResponse toResponse(ReaderEntity entity) {
        return new ReaderDtos.ReaderResponse(entity.getId(), entity.getFullName(), entity.getRoleType(),
                entity.getClassName(), entity.getContact(), entity.getQrCode());
    }
}
