package com.financeai.controller;

import com.financeai.dto.ReportDto.ReportPayload;
import com.financeai.security.UserPrincipal;
import com.financeai.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ReportPayload summary(@AuthenticationPrincipal UserPrincipal principal,
                                 @RequestParam(required = false) String period,
                                 @RequestParam(required = false) String from,
                                 @RequestParam(required = false) String to) {
        return reportService.summary(principal.getId(), period, from, to);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestParam(required = false) String period,
                                            @RequestParam(required = false) String from,
                                            @RequestParam(required = false) String to) {
        byte[] pdf = reportService.pdf(principal.getId(), period, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"financeai-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestParam(required = false) String period,
                                            @RequestParam(required = false) String from,
                                            @RequestParam(required = false) String to) {
        byte[] csv = reportService.csv(principal.getId(), period, from, to);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"financeai-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(csv.length)
                .body(csv);
    }
}