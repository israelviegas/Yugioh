package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Card;
import com.yugioh.trading.models.User;
import com.yugioh.trading.models.UserCard;
import com.yugioh.trading.repositories.CardRepository;
import com.yugioh.trading.repositories.UserCardRepository;
import com.yugioh.trading.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-cards")
public class UserCardController {

    private final UserCardRepository userCardRepository;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final com.yugioh.trading.repositories.CardConditionRepository conditionRepository;

    public UserCardController(UserCardRepository userCardRepository, UserRepository userRepository, CardRepository cardRepository, com.yugioh.trading.repositories.CardConditionRepository conditionRepository) {
        this.userCardRepository = userCardRepository;
        this.userRepository = userRepository;
        this.cardRepository = cardRepository;
        this.conditionRepository = conditionRepository;
    }

    @PostMapping
    public ResponseEntity<?> addUserCard(@RequestBody AddUserCardRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        Optional<Card> cardOpt = cardRepository.findById(request.getCardId());

        if (userOpt.isEmpty() || cardOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Card not found");
        }

        UserCard userCard = new UserCard();
        userCard.setUser(userOpt.get());
        userCard.setCard(cardOpt.get());
        userCard.setStatus(request.getStatus() != null ? request.getStatus() : "COLLECTION");
        userCard.setPrice(request.getPrice() != null ? request.getPrice() : 0.0);
        
        if (request.getConditionCode() != null) {
            conditionRepository.findById(request.getConditionCode()).ifPresent(userCard::setCondition);
        }
        if (request.getRarity() != null) {
            userCard.setRarity(request.getRarity());
        }

        UserCard saved = userCardRepository.save(userCard);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserCard(@PathVariable Long id, @RequestBody UpdateUserCardRequest request) {
        Optional<UserCard> ucOpt = userCardRepository.findById(id);
        if (ucOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UserCard userCard = ucOpt.get();
        if (request.getStatus() != null) {
            userCard.setStatus(request.getStatus());
        }
        if (request.getPrice() != null) {
            userCard.setPrice(request.getPrice());
        }
        if (request.getConditionCode() != null) {
            conditionRepository.findById(request.getConditionCode()).ifPresent(userCard::setCondition);
        }
        if (request.getRarity() != null) {
            userCard.setRarity(request.getRarity());
        }

        UserCard updated = userCardRepository.save(userCard);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserCard(@PathVariable Long id) {
        if (!userCardRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userCardRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/market")
    public ResponseEntity<List<UserCard>> getMarketCards() {
        List<UserCard> forSale = userCardRepository.findByStatus("FOR_SALE");
        List<UserCard> forTrade = userCardRepository.findByStatus("FOR_TRADE");
        
        List<UserCard> market = new ArrayList<>();
        market.addAll(forSale);
        market.addAll(forTrade);

        return ResponseEntity.ok(market);
    }

    static class AddUserCardRequest {
        private Long userId;
        private Long cardId;
        private String status;
        private Double price;
        private String conditionCode;
        private String rarity;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getCardId() { return cardId; }
        public void setCardId(Long cardId) { this.cardId = cardId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getConditionCode() { return conditionCode; }
        public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }
        public String getRarity() { return rarity; }
        public void setRarity(String rarity) { this.rarity = rarity; }
    }

    static class UpdateUserCardRequest {
        private String status;
        private Double price;
        private String conditionCode;
        private String rarity;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getConditionCode() { return conditionCode; }
        public void setConditionCode(String conditionCode) { this.conditionCode = conditionCode; }
        public String getRarity() { return rarity; }
        public void setRarity(String rarity) { this.rarity = rarity; }
    }
}
