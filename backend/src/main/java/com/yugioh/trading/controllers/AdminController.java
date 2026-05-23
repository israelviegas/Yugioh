package com.yugioh.trading.controllers;

import com.yugioh.trading.services.CardSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CardSyncService cardSyncService;

    public AdminController(CardSyncService cardSyncService) {
        this.cardSyncService = cardSyncService;
    }

    @PostMapping("/sync-cards")
    public ResponseEntity<Map<String, String>> syncCards() {
        // Run sync in a separate thread so it doesn't block the HTTP request
        new Thread(() -> {
            try {
                cardSyncService.syncCards();
            } catch (Exception e) {
                System.err.println("Erro na sincronização manual: " + e.getMessage());
            }
        }).start();

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Collections.singletonMap("message", "Sincronização iniciada com sucesso em segundo plano."));
    }
}
