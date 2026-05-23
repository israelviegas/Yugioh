package com.yugioh.trading.controllers;

import com.yugioh.trading.models.CardCondition;
import com.yugioh.trading.repositories.CardConditionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conditions")
public class CardConditionController {

    private final CardConditionRepository conditionRepository;

    public CardConditionController(CardConditionRepository conditionRepository) {
        this.conditionRepository = conditionRepository;
    }

    @GetMapping
    public ResponseEntity<List<CardCondition>> getAllConditions() {
        return ResponseEntity.ok(conditionRepository.findAll());
    }
}
