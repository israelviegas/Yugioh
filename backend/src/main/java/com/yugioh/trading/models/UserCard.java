package com.yugioh.trading.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_cards")
@Data
public class UserCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "card_id")
    private Card card;

    // Status: COLLECTION, FOR_SALE, FOR_TRADE
    private String status;

    private Double price;

    @ManyToOne
    @JoinColumn(name = "condition_code")
    private CardCondition condition;
}
