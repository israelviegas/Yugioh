package com.yugioh.trading.repositories;

import com.yugioh.trading.models.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StrategyRepository extends JpaRepository<Strategy, Long> {
}
