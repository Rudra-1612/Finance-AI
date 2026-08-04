package com.financeai.service;

import com.financeai.dto.ReportDto.*;
import com.financeai.dto.TransactionDto.TransactionResponse;
import com.financeai.exception.BadRequestException;
import com.financeai.model.User;
import com.financeai.repository.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class ReportService {

    private final TransactionService transactionService;
    private final InsightService insightService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReportService(TransactionService transactionService,
                         InsightService insightService,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.transactionService = transactionService;
        this.insightService = insightService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public ReportPayload summary(Long userId, String period, String from, String to) {
        LocalDate start;
        LocalDate end;
        YearMonth current = YearMonth.now();

        if (from != null && to != null) {
            start = parseDate(from);
            end = parseDate(to);
            if (end.isBefore(start)) throw new BadRequestException("'to' must be after 'from'");
        } else if ("month".equalsIgnoreCase(period) || period == null || period.isBlank()) {
            start = current.atDay(1);
            end = current.atEndOfMonth();
        } else if ("quarter".equalsIgnoreCase(period)) {
            YearMonth qStart = current.minusMonths(2);
            start = qStart.atDay(1);
            end = current.atEndOfMonth();
        } else if ("year".equalsIgnoreCase(period)) {
            start = current.withMonth(1).atDay(1);
            end = current.atEndOfMonth();
        } else {
            throw new BadRequestException("Unknown period: " + period);
        }

        List<TransactionResponse> txs = transactionService.list(userId, null, null, null, null)
                .stream()
                .filter(t -> {
                    LocalDate d = LocalDate.parse(t.date());
                    return !d.isBefore(start) && !d.isAfter(end);
                })
                .toList();

        BigDecimal income = insightService.sumIncome(txs);
        BigDecimal expenses = insightService.sumExpenses(txs);
        BigDecimal savings = income.subtract(expenses);
        int savingsRate = income.signum() > 0
                ? savings.multiply(BigDecimal.valueOf(100)).divide(income, 0, RoundingMode.HALF_UP).intValue()
                : 0;

        // Monthly breakdown across the range (cap at 12 buckets)
        List<MonthlyPoint> monthly = new ArrayList<>();
        YearMonth startYm = YearMonth.from(start);
        YearMonth endYm = YearMonth.from(end);
        int buckets = Math.max(1, (int) java.time.temporal.ChronoUnit.MONTHS.between(startYm, endYm) + 1);
        if (buckets > 12) {
            startYm = endYm.minusMonths(11);
        }
        for (YearMonth ym = startYm; !ym.isAfter(endYm); ym = ym.plusMonths(1)) {
            final YearMonth m = ym;
            List<TransactionResponse> bucket = txs.stream().filter(t ->
                    YearMonth.from(LocalDate.parse(t.date())).equals(m)).toList();
            BigDecimal inc = insightService.sumIncome(bucket);
            BigDecimal exp = insightService.sumExpenses(bucket);
            monthly.add(new MonthlyPoint(
                    ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), inc, exp, inc.subtract(exp)));
        }

        // Category breakdown
        Map<String, BigDecimal> cats = new LinkedHashMap<>();
        txs.stream().filter(t -> "expense".equalsIgnoreCase(t.type()))
                .forEach(t -> cats.merge(t.category(), t.amount().abs(), BigDecimal::add));
        List<CategoryRow> categoryRows = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : cats.entrySet()) {
            int pct = expenses.signum() > 0
                    ? e.getValue().multiply(BigDecimal.valueOf(100)).divide(expenses, 0, RoundingMode.HALF_UP).intValue()
                    : 0;
            categoryRows.add(new CategoryRow(e.getKey(), e.getValue(), pct));
        }

        return new ReportPayload(period == null ? "month" : period, start.toString(), end.toString(),
                income, expenses, savings, savings, savingsRate, monthly, categoryRows);
    }

    /**
     * Renders a branded multi-page PDF report from real data.
     */
    @Transactional(readOnly = true)
    public byte[] pdf(Long userId, String period, String from, String to) {
        ReportPayload r = summary(userId, period, from, to);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.financeai.exception.ResourceNotFoundException("User not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font hFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph brand = new Paragraph("FinanceAI", titleFont);
            brand.setSpacingAfter(2);
            doc.add(brand);

            Paragraph title = new Paragraph("Financial Report", subFont);
            title.setSpacingAfter(2);
            doc.add(title);
            doc.add(new Paragraph("Prepared for " + user.getFullName() + " (" + user.getEmail() + ")",
                    subFont));
            doc.add(new Paragraph("Period: " + r.from() + " to " + r.to(),
                    subFont));
            doc.add(new Paragraph("Generated: " + java.time.LocalDateTime.now().withNano(0),
                    subFont));

            doc.add(new Paragraph(" "));

            // Summary table
            PdfPTable sumTable = new PdfPTable(4);
            sumTable.setWidthPercentage(100);
            addCell(sumTable, "Income", Element.ALIGN_LEFT, hFont, false);
            addCell(sumTable, "Expenses", Element.ALIGN_LEFT, hFont, false);
            addCell(sumTable, "Savings", Element.ALIGN_LEFT, hFont, false);
            addCell(sumTable, "Savings Rate", Element.ALIGN_LEFT, hFont, false);
            addCell(sumTable, money(r.income()), Element.ALIGN_LEFT, cellFont, true);
            addCell(sumTable, money(r.expenses()), Element.ALIGN_LEFT, cellFont, true);
            addCell(sumTable, money(r.savings()), Element.ALIGN_LEFT, cellFont, true);
            addCell(sumTable, r.savingsRate() + "%", Element.ALIGN_LEFT, cellFont, true);
            doc.add(sumTable);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Monthly Breakdown", hFont));
            doc.add(new Paragraph(" "));
            PdfPTable monthlyTable = new PdfPTable(4);
            monthlyTable.setWidthPercentage(100);
            addCell(monthlyTable, "Month", Element.ALIGN_LEFT, cellFont, false);
            addCell(monthlyTable, "Income", Element.ALIGN_RIGHT, cellFont, false);
            addCell(monthlyTable, "Expenses", Element.ALIGN_RIGHT, cellFont, false);
            addCell(monthlyTable, "Savings", Element.ALIGN_RIGHT, cellFont, false);
            for (MonthlyPoint m : r.monthly()) {
                addCell(monthlyTable, m.month(), Element.ALIGN_LEFT, cellFont, true);
                addCell(monthlyTable, money(m.income()), Element.ALIGN_RIGHT, cellFont, true);
                addCell(monthlyTable, money(m.expenses()), Element.ALIGN_RIGHT, cellFont, true);
                addCell(monthlyTable, money(m.savings()), Element.ALIGN_RIGHT, cellFont, true);
            }
            doc.add(monthlyTable);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Expenses by Category", hFont));
            doc.add(new Paragraph(" "));
            PdfPTable catTable = new PdfPTable(3);
            catTable.setWidthPercentage(100);
            addCell(catTable, "Category", Element.ALIGN_LEFT, cellFont, false);
            addCell(catTable, "Amount", Element.ALIGN_RIGHT, cellFont, false);
            addCell(catTable, "Share", Element.ALIGN_RIGHT, cellFont, false);
            for (CategoryRow c : r.categories()) {
                addCell(catTable, c.category(), Element.ALIGN_LEFT, cellFont, true);
                addCell(catTable, money(c.amount()), Element.ALIGN_RIGHT, cellFont, true);
                addCell(catTable, c.percent() + "%", Element.ALIGN_RIGHT, cellFont, true);
            }
            doc.add(catTable);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("DISCLAIMER: This report is generated from data you entered in FinanceAI. "
                    + "It is for educational purposes and is not professional financial advice.", subFont));

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
        return out.toByteArray();
    }

    /** Generates a CSV report of the period plus a full transaction dump. */
    @Transactional(readOnly = true)
    public byte[] csv(Long userId, String period, String from, String to) {
        ReportPayload r = summary(userId, period, from, to);
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw,
                CSVFormat.DEFAULT.builder().setHeader("FinanceAI Report").build())) {

            printer.printRecord("Period", r.from(), "to", r.to());
            printer.printRecord("Income", r.income());
            printer.printRecord("Expenses", r.expenses());
            printer.printRecord("Savings", r.savings());
            printer.printRecord("Savings Rate (%)", r.savingsRate());
            printer.printRecord();
            printer.printRecord("Monthly Breakdown");
            printer.printRecord("Month", "Income", "Expenses", "Savings");
            for (MonthlyPoint m : r.monthly()) {
                printer.printRecord(m.month(), m.income(), m.expenses(), m.savings());
            }
            printer.printRecord();
            printer.printRecord("Expenses by Category");
            printer.printRecord("Category", "Amount", "Share (%)");
            for (CategoryRow c : r.categories()) {
                printer.printRecord(c.category(), c.amount(), c.percent());
            }
            printer.flush();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV report", e);
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    /** Exports all transactions matched by the filters to CSV. */
    @Transactional(readOnly = true)
    public byte[] transactionsCsv(Long userId, String search, String category, String type, String month) {
        List<TransactionResponse> txs = transactionService.list(userId, search, category, type, month);
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw,
                CSVFormat.DEFAULT.builder().setHeader(
                        "id", "date", "description", "category", "paymentMethod", "amount", "type").build())) {
            for (TransactionResponse t : txs) {
                printer.printRecord(t.id(), t.date(), t.description(), t.category(),
                        t.paymentMethod() == null ? "" : t.paymentMethod(), t.amount(), t.type());
            }
            printer.flush();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate transaction CSV", e);
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void addCell(PdfPTable table, String text, int align, Font font, boolean whiteBackground) {
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, font));
        cell.setHorizontalAlignment(align);
        cell.setPadding(6);
        if (whiteBackground) {
            cell.setGrayFill(0.97f);
        }
        table.addCell(cell);
    }

    private String money(BigDecimal v) {
        return "$" + String.format("%,.2f", v);
    }

    private LocalDate parseDate(String d) {
        try {
            return LocalDate.parse(d);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date. Use yyyy-MM-dd.");
        }
    }
}