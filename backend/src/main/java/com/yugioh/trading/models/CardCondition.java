package com.yugioh.trading.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "card_conditions")
@Data
public class CardCondition {
    
    @Id
    private String code; // NM, LP, MP, HP, DMG
    
    private String nameEn;
    private String namePt;
    private String nameJa;
    
    public CardCondition() {}
    
    public CardCondition(String code, String nameEn, String namePt, String nameJa) {
        this.code = code;
        this.nameEn = nameEn;
        this.namePt = namePt;
        this.nameJa = nameJa;
    }
}
