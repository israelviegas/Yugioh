package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Card;
import com.yugioh.trading.repositories.CardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardRepository cardRepository;

    public CardController(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @GetMapping
    public ResponseEntity<?> getCards(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean all) {
        
        if (all != null && all) {
            return ResponseEntity.ok(cardRepository.findAll());
        }
        
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.trim().isEmpty()) {
            String query = "%" + search.trim() + "%";
            Page<Card> result = cardRepository.searchCards(query, pageable);
            return ResponseEntity.ok(result);
        }
        
        return ResponseEntity.ok(cardRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable Long id) {
        return cardRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
