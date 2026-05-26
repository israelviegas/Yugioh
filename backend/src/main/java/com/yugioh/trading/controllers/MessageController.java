package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Message;
import com.yugioh.trading.models.User;
import com.yugioh.trading.repositories.MessageRepository;
import com.yugioh.trading.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageController(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}/{targetUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, @PathVariable Long targetUserId) {
        User user1 = userRepository.findById(userId).orElse(null);
        User user2 = userRepository.findById(targetUserId).orElse(null);

        if (user1 == null || user2 == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Message> conversation = messageRepository.findConversation(user1, user2);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/{userId}/inbox")
    public ResponseEntity<?> getInbox(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        List<Message> inbox = messageRepository.findInbox(user);
        return ResponseEntity.ok(inbox);
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        long count = messageRepository.countByReceiverAndIsReadFalse(user);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{userId}/{targetUserId}/read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long userId, @PathVariable Long targetUserId) {
        User user = userRepository.findById(userId).orElse(null);
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (user == null || targetUser == null) {
            return ResponseEntity.badRequest().body("User or Target not found");
        }
        messageRepository.markAsRead(targetUser, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO payload) {
        User sender = userRepository.findById(payload.getSenderId()).orElse(null);
        User receiver = userRepository.findById(payload.getReceiverId()).orElse(null);

        if (sender == null || receiver == null) {
            return ResponseEntity.badRequest().body("Sender or Receiver not found");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(payload.getContent());

        Message savedMessage = messageRepository.save(message);
        return ResponseEntity.ok(savedMessage);
    }

    public static class MessageDTO {
        private Long senderId;
        private Long receiverId;
        private String content;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public Long getReceiverId() { return receiverId; }
        public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
