package com.yugioh.trading.models;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class CardSetInfo {
    private String setName;
    private String setCode;
    private String setRarity;
    private String setRarityCode;
    private String setPrice;
}
