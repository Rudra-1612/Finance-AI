package com.financeai.service;

import com.financeai.dto.InvestmentDto.*;
import com.financeai.exception.BadRequestException;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.Investment;
import com.financeai.model.User;
import com.financeai.repository.InvestmentRepository;
import com.financeai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;

    public InvestmentService(InvestmentRepository investmentRepository, UserRepository userRepository) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InvestmentResponse> list(Long userId) {
        return investmentRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map(InvestmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvestmentResponse get(Long userId, Long id) {
        return InvestmentResponse.from(findEntity(userId, id));
    }

    @Transactional
    public InvestmentResponse create(Long userId, InvestmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Investment inv = new Investment();
        inv.setUser(user);
        apply(inv, request);
        return InvestmentResponse.from(investmentRepository.save(inv));
    }

    @Transactional
    public InvestmentResponse update(Long userId, Long id, InvestmentRequest request) {
        Investment inv = findEntity(userId, id);
        apply(inv, request);
        return InvestmentResponse.from(investmentRepository.save(inv));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Investment inv = findEntity(userId, id);
        investmentRepository.delete(inv);
    }

    @Transactional(readOnly = true)
    public BigDecimal portfolioValue(Long userId) {
        return investmentRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map(inv -> inv.getUnits().multiply(inv.getCurrentPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> library() {
        return List.of(
                Map.of("title", "S&P 500 ETFs", "category", "Equity", "risk", "Moderate",
                        "horizon", "5-10 Years", "liquidity", "High", "return", "8-10% avg",
                        "description", "Broad market exposure tracking the 500 largest US companies. A staple for long-term wealth building with built-in diversification."),
                Map.of("title", "US Treasury Bonds", "category", "Fixed Income", "risk", "Low",
                        "horizon", "1-30 Years", "liquidity", "High", "return", "4-5% avg",
                        "description", "Government-backed debt securities. Historically safe haven assets that provide regular interest payments and preserve capital."),
                Map.of("title", "Dividend Aristocrats", "category", "Equity", "risk", "Moderate",
                        "horizon", "5+ Years", "liquidity", "High", "return", "7-9% avg",
                        "description", "Companies that have consecutively increased their dividend payouts for at least 25 years. Strong cash flow generators."),
                Map.of("title", "Physical Gold", "category", "Commodities", "risk", "Low-Moderate",
                        "horizon", "10+ Years", "liquidity", "Moderate", "return", "Variable",
                        "description", "Traditional inflation hedge and store of value. Often performs inversely to the stock market during times of economic stress."),
                Map.of("title", "High-Yield Fixed Deposits", "category", "Cash Equivalent", "risk", "Very Low",
                        "horizon", "3 Months - 5 Years", "liquidity", "Low", "return", "4-5.5% avg",
                        "description", "Bank deposits offering guaranteed returns over a fixed period. Your principal is insured up to FDIC limits."),
                Map.of("title", "Tech Growth Mutual Funds", "category", "Equity", "risk", "High",
                        "horizon", "7+ Years", "liquidity", "High", "return", "10-15% avg",
                        "description", "Actively managed funds focusing on innovative technology companies. Higher volatility but potential for outsized returns.")
        );
    }

    private void apply(Investment inv, InvestmentRequest r) {
        inv.setName(r.name().trim());
        inv.setType(r.type().trim());
        inv.setCategory(r.category().trim());
        inv.setTicker(r.ticker() == null ? null : r.ticker().trim());
        inv.setUnits(r.units());
        inv.setPurchasePrice(r.purchasePrice());
        inv.setCurrentPrice(r.currentPrice());
        inv.setPurchaseDate(parseDate(r.purchaseDate()));
        inv.setRisk(r.risk() == null ? "Moderate" : r.risk());
        inv.setDescription(r.description());
    }

    private Investment findEntity(Long userId, Long id) {
        return investmentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment not found"));
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date format. Use yyyy-MM-dd.");
        }
    }
}