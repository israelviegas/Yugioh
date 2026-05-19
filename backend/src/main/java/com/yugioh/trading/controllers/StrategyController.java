package com.yugioh.trading.controllers;

import com.yugioh.trading.models.Strategy;
import com.yugioh.trading.models.User;
import com.yugioh.trading.repositories.StrategyRepository;
import com.yugioh.trading.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    private final StrategyRepository strategyRepository;
    private final UserRepository userRepository;

    public StrategyController(StrategyRepository strategyRepository, UserRepository userRepository) {
        this.strategyRepository = strategyRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Strategy> getAllStrategies() {
        return strategyRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createStrategy(@RequestBody CreateStrategyRequest request) {
        Optional<User> authorOpt = userRepository.findById(request.getAuthorId());
        if (authorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Author not found");
        }

        Strategy strategy = new Strategy();
        strategy.setAuthor(authorOpt.get());
        strategy.setTitle(request.getTitle());
        strategy.setContent(request.getContent());
        strategy.setTitleEn(request.getTitle());
        strategy.setTitlePt(request.getTitle());
        strategy.setTitleJa(request.getTitle());
        strategy.setContentEn(request.getContent());
        strategy.setContentPt(request.getContent());
        strategy.setContentJa(request.getContent());
        strategy.setVideoUrl(request.getVideoUrl());
        strategy.setCreatedAt(LocalDateTime.now());

        Strategy saved = strategyRepository.save(strategy);
        return ResponseEntity.ok(saved);
    }

    static class CreateStrategyRequest {
        private Long authorId;
        private String title;
        private String content;
        private String videoUrl;

        public Long getAuthorId() { return authorId; }
        public void setAuthorId(Long authorId) { this.authorId = authorId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getVideoUrl() { return videoUrl; }
        public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    }
}
