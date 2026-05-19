package com.yugioh.trading.repositories;

import com.yugioh.trading.models.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
