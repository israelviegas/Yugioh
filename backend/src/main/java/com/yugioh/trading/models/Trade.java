package com.yugioh.trading.models;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "trades")
@Data
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToMany
    @JoinTable(
        name = "trade_offered_cards",
        joinColumns = @JoinColumn(name = "trade_id"),
        inverseJoinColumns = @JoinColumn(name = "user_card_id")
    )
    private List<UserCard> offeredCards;

    @ManyToMany
    @JoinTable(
        name = "trade_requested_cards",
        joinColumns = @JoinColumn(name = "trade_id"),
        inverseJoinColumns = @JoinColumn(name = "user_card_id")
    )
    private List<UserCard> requestedCards;

    // Status: PENDING, ACCEPTED, REJECTED
    private String status;
}
