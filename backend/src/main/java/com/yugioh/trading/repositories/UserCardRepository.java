package com.yugioh.trading.repositories;

import com.yugioh.trading.models.UserCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    List<UserCard> findByUserId(Long userId);
    List<UserCard> findByStatus(String status);
}
