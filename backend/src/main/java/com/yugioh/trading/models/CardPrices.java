package com.yugioh.trading.models;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CardPrices {
    private String cardmarketPrice;
    private String tcgplayerPrice;
    private String ebayPrice;
    private String amazonPrice;
    private String coolstuffincPrice;
}
