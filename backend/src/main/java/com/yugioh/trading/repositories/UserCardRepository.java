package com.yugioh.trading.repositories;

import com.yugioh.trading.models.UserCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    // Retorna a lista de cartas do usuário ordenada pelo ID de forma crescente para garantir uma ordenação física estável.
    List<UserCard> findByUserIdOrderByIdAsc(Long userId);
    List<UserCard> findByStatus(String status);
}
