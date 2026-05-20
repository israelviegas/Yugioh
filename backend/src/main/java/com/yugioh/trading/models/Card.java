package com.yugioh.trading.models;

import jakarta.persistence.*;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    private Long id; // We will use YGOPRODeck ID

    private String name;
    private String type;
    
    @Column(length = 2000)
    private String description;

    private String namePt;
    @Column(length = 2000)
    private String descriptionPt;

    private String nameJa;
    @Column(length = 2000)
    private String descriptionJa;
    
    private Integer attack;
    private Integer defense;
    private Integer level;
    private String attribute;

    private String imageUrl;
    private String imageUrlPt;
    private String imageUrlJa;

    @Column(columnDefinition = "boolean default false")
    private Boolean translatedBySystem = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNamePt() { return namePt; }
    public void setNamePt(String namePt) { this.namePt = namePt; }

    public String getDescriptionPt() { return descriptionPt; }
    public void setDescriptionPt(String descriptionPt) { this.descriptionPt = descriptionPt; }

    public String getNameJa() { return nameJa; }
    public void setNameJa(String nameJa) { this.nameJa = nameJa; }

    public String getDescriptionJa() { return descriptionJa; }
    public void setDescriptionJa(String descriptionJa) { this.descriptionJa = descriptionJa; }

    public Integer getAttack() { return attack; }
    public void setAttack(Integer attack) { this.attack = attack; }

    public Integer getDefense() { return defense; }
    public void setDefense(Integer defense) { this.defense = defense; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getAttribute() { return attribute; }
    public void setAttribute(String attribute) { this.attribute = attribute; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageUrlPt() { return imageUrlPt; }
    public void setImageUrlPt(String imageUrlPt) { this.imageUrlPt = imageUrlPt; }

    public String getImageUrlJa() { return imageUrlJa; }
    public void setImageUrlJa(String imageUrlJa) { this.imageUrlJa = imageUrlJa; }

    public Boolean getTranslatedBySystem() { return translatedBySystem; }
    public void setTranslatedBySystem(Boolean translatedBySystem) { this.translatedBySystem = translatedBySystem; }
}
