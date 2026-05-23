package com.yugioh.trading.controllers;

import com.yugioh.trading.models.User;
import com.yugioh.trading.models.UserCard;
import com.yugioh.trading.repositories.UserCardRepository;
import com.yugioh.trading.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserCardRepository userCardRepository;

    public UserController(UserRepository userRepository, UserCardRepository userCardRepository) {
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            // Mock JWT response para simplicidade do protótipo
            return ResponseEntity.ok(new AuthResponse("fake-jwt-token-12345", userOpt.get()));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("USER");

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(new AuthResponse("fake-jwt-token-12345", savedUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(request.getPassword());
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/{id}/cards")
    public ResponseEntity<List<UserCard>> getUserCards(@PathVariable Long id) {
        List<UserCard> cards = userCardRepository.findByUserId(id);
        return ResponseEntity.ok(cards);
    }

    static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class AuthResponse {
        private String token;
        private User user;
        public AuthResponse(String token, User user) { this.token = token; this.user = user; }
        public String getToken() { return token; }
        public User getUser() { return user; }
    }

    static class UserUpdateRequest {
        private String username;
        private String email;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
