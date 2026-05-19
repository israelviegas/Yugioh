package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Trade;
import com.yugioh.trading.models.User;
import com.yugioh.trading.models.UserCard;
import com.yugioh.trading.repositories.TradeRepository;
import com.yugioh.trading.repositories.UserCardRepository;
import com.yugioh.trading.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;
    private final UserCardRepository userCardRepository;

    public TradeController(TradeRepository tradeRepository, UserRepository userRepository, UserCardRepository userCardRepository) {
        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
    }

    @PostMapping
    public ResponseEntity<?> createTrade(@RequestBody CreateTradeRequest request) {
        Optional<User> senderOpt = userRepository.findById(request.getSenderId());
        Optional<User> receiverOpt = userRepository.findById(request.getReceiverId());

        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Sender or Receiver not found");
        }

        List<UserCard> offered = userCardRepository.findAllById(request.getOfferedCardIds());
        List<UserCard> requested = userCardRepository.findAllById(request.getRequestedCardIds());

        if (offered.isEmpty() || requested.isEmpty()) {
            return ResponseEntity.badRequest().body("Offered or Requested cards not found");
        }

        Trade trade = new Trade();
        trade.setSender(senderOpt.get());
        trade.setReceiver(receiverOpt.get());
        trade.setOfferedCards(offered);
        trade.setRequestedCards(requested);
        trade.setStatus("PENDING");

        Trade saved = tradeRepository.save(trade);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Trade>> getUserTrades(@PathVariable Long userId) {
        List<Trade> trades = tradeRepository.findBySenderIdOrReceiverId(userId, userId);
        return ResponseEntity.ok(trades);
    }

    @PutMapping("/{tradeId}/respond")
    public ResponseEntity<?> respondTrade(@PathVariable Long tradeId, @RequestBody RespondTradeRequest request) {
        Optional<Trade> tradeOpt = tradeRepository.findById(tradeId);
        if (tradeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trade trade = tradeOpt.get();
        if (!"PENDING".equals(trade.getStatus())) {
            return ResponseEntity.badRequest().body("Trade is not pending");
        }

        String newStatus = request.getStatus();
        if ("ACCEPTED".equals(newStatus)) {
            trade.setStatus("ACCEPTED");

            // Swap ownership
            User sender = trade.getSender();
            User receiver = trade.getReceiver();

            for (UserCard uc : trade.getOfferedCards()) {
                uc.setUser(receiver);
                uc.setStatus("COLLECTION");
                userCardRepository.save(uc);
            }

            for (UserCard uc : trade.getRequestedCards()) {
                uc.setUser(sender);
                uc.setStatus("COLLECTION");
                userCardRepository.save(uc);
            }
        } else {
            trade.setStatus("REJECTED");
        }

        Trade updated = tradeRepository.save(trade);
        return ResponseEntity.ok(updated);
    }

    static class CreateTradeRequest {
        private Long senderId;
        private Long receiverId;
        private List<Long> offeredCardIds;
        private List<Long> requestedCardIds;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public Long getReceiverId() { return receiverId; }
        public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
        public List<Long> getOfferedCardIds() { return offeredCardIds; }
        public void setOfferedCardIds(List<Long> offeredCardIds) { this.offeredCardIds = offeredCardIds; }
        public List<Long> getRequestedCardIds() { return requestedCardIds; }
        public void setRequestedCardIds(List<Long> requestedCardIds) { this.requestedCardIds = requestedCardIds; }
    }

    static class RespondTradeRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
