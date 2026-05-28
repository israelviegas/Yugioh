package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Card;
import com.yugioh.trading.repositories.CardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            @RequestParam(required = false) String rarity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean all) {
        
        if (all != null && all) {
            // Se for solicitada a lista completa filtrada por raridade
            if (rarity != null && !rarity.trim().isEmpty()) {
                return ResponseEntity.ok(cardRepository.findAllByRarity(rarity.trim(), Sort.by("name").ascending()));
            }
            return ResponseEntity.ok(cardRepository.findAll(Sort.by("name").ascending()));
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasRarity = rarity != null && !rarity.trim().isEmpty();

        // Combinações de filtragem por busca textual e raridade
        if (hasSearch && hasRarity) {
            String query = "%" + search.trim() + "%";
            return ResponseEntity.ok(cardRepository.searchCardsAndRarity(query, rarity.trim(), pageable));
        } else if (hasSearch) {
            String query = "%" + search.trim() + "%";
            return ResponseEntity.ok(cardRepository.searchCards(query, pageable));
        } else if (hasRarity) {
            return ResponseEntity.ok(cardRepository.findByRarity(rarity.trim(), pageable));
        }
        
        return ResponseEntity.ok(cardRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable Long id) {
        return cardRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para retornar todas as raridades distintas ordenadas alfabeticamente
    @GetMapping("/rarities")
    public ResponseEntity<?> getRarities() {
        return ResponseEntity.ok(cardRepository.findDistinctRarities());
    }
}
