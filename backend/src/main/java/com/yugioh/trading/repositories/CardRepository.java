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

    @Query("SELECT c.id FROM Card c")
    java.util.List<Long> findAllIds();

    // Consulta para listar todas as raridades distintas ordenadas alfabeticamente
    @Query("SELECT DISTINCT cs.setRarity FROM Card c JOIN c.cardSets cs WHERE cs.setRarity IS NOT NULL AND cs.setRarity != '' ORDER BY cs.setRarity ASC")
    java.util.List<String> findDistinctRarities();

    // Consulta para filtrar cartas por nome/termo e por raridade de forma combinada
    @Query(value = "SELECT DISTINCT c FROM Card c JOIN c.cardSets cs WHERE " +
           "(LOWER(c.name) LIKE LOWER(:query) OR " +
           " LOWER(c.namePt) LIKE LOWER(:query) OR " +
           " LOWER(c.nameJa) LIKE LOWER(:query)) AND " +
           "cs.setRarity = :rarity",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Card c JOIN c.cardSets cs WHERE " +
           "(LOWER(c.name) LIKE LOWER(:query) OR " +
           " LOWER(c.namePt) LIKE LOWER(:query) OR " +
           " LOWER(c.nameJa) LIKE LOWER(:query)) AND " +
           "cs.setRarity = :rarity")
    Page<Card> searchCardsAndRarity(@Param("query") String query, @Param("rarity") String rarity, Pageable pageable);

    // Consulta para filtrar cartas por raridade
    @Query(value = "SELECT DISTINCT c FROM Card c JOIN c.cardSets cs WHERE cs.setRarity = :rarity",
           countQuery = "SELECT COUNT(DISTINCT c) FROM Card c JOIN c.cardSets cs WHERE cs.setRarity = :rarity")
    Page<Card> findByRarity(@Param("rarity") String rarity, Pageable pageable);

    // Consulta sem paginacao para listar todas as cartas filtradas por raridade
    @Query("SELECT DISTINCT c FROM Card c JOIN c.cardSets cs WHERE cs.setRarity = :rarity")
    java.util.List<Card> findAllByRarity(@Param("rarity") String rarity, org.springframework.data.domain.Sort sort);
}
