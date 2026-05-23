package com.yugioh.trading.repositories;

import com.yugioh.trading.models.CardCondition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardConditionRepository extends JpaRepository<CardCondition, String> {
}
