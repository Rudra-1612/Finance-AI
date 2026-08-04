package com.financeai.controller;

import com.financeai.dto.ConversationDto.*;
import com.financeai.security.UserPrincipal;
import com.financeai.service.AdvisorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/openai")
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> listConversations(@AuthenticationPrincipal UserPrincipal principal) {
        return advisorService.listConversations(principal.getId());
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @Valid @RequestBody ConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(advisorService.createConversation(principal.getId(), request));
    }

    @GetMapping("/conversations/{id}")
    public ConversationResponse getConversation(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long id) {
        return advisorService.getConversation(principal.getId(), id);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable Long id) {
        advisorService.deleteConversation(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conversations/{id}/messages")
    public List<MessageResponse> listMessages(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long id) {
        return advisorService.listMessages(principal.getId(), id);
    }

    @PostMapping(value = "/conversations/{id}/messages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendMessage(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable Long id,
                                  @Valid @RequestBody MessageRequest request) {
        return advisorService.sendMessage(principal.getId(), id, request.content());
    }
}