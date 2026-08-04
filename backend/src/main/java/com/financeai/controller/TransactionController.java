package com.financeai.controller;

import com.financeai.dto.TransactionDto.*;
import com.financeai.security.UserPrincipal;
import com.financeai.service.ReportService;
import com.financeai.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final ReportService reportService;

    public TransactionController(TransactionService transactionService, ReportService reportService) {
        this.transactionService = transactionService;
        this.reportService = reportService;
    }

    @GetMapping
    public List<TransactionResponse> list(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestParam(required = false) String search,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false) String type,
                                          @RequestParam(required = false) String month) {
        return transactionService.list(principal.getId(), search, category, type, month);
    }

    @GetMapping("/{id}")
    public TransactionResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return transactionService.get(principal.getId(), id);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                      @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long id,
                                      @Valid @RequestBody TransactionRequest request) {
        return transactionService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        transactionService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestParam(required = false) String search,
                                            @RequestParam(required = false) String category,
                                            @RequestParam(required = false) String type,
                                            @RequestParam(required = false) String month) {
        byte[] data = reportService.transactionsCsv(principal.getId(), search, category, type, month);
        String filename = "transactions.csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(data.length)
                .body(data);
    }
}