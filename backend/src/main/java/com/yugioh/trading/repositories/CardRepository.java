package com.yugioh.trading.repositories;

import com.yugioh.trading.models.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CardRepository extends JpaRepository<Card, Long> {
    @Query("SELECT c FROM Card c WHERE " +
           "LOWER(c.name) LIKE LOWER(:query) OR " +
           "LOWER(c.namePt) LIKE LOWER(:query) OR " +
           "LOWER(c.nameJa) LIKE LOWER(:query)")
    Page<Card> searchCards(@Param("query") String query, Pageable pageable);
}
