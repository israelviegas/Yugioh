package com.yugioh.trading.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    private Long id; // We will use YGOPRODeck ID

    private String name;
    private String type;
    private String frameType;
    private String race;
    private String archetype;
    private Integer scale;
    private Integer linkval;
    
    @ElementCollection
    @CollectionTable(name = "card_linkmarkers", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "marker")
    private List<String> linkmarkers;

    @Embedded
    private CardPrices prices;

    @ElementCollection
    @CollectionTable(name = "card_sets_info", joinColumns = @JoinColumn(name = "card_id"))
    private List<CardSetInfo> cardSets;
    
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

    public String getFrameType() { return frameType; }
    public void setFrameType(String frameType) { this.frameType = frameType; }

    public String getRace() { return race; }
    public void setRace(String race) { this.race = race; }

    public String getArchetype() { return archetype; }
    public void setArchetype(String archetype) { this.archetype = archetype; }

    public Integer getScale() { return scale; }
    public void setScale(Integer scale) { this.scale = scale; }

    public Integer getLinkval() { return linkval; }
    public void setLinkval(Integer linkval) { this.linkval = linkval; }

    public List<String> getLinkmarkers() { return linkmarkers; }
    public void setLinkmarkers(List<String> linkmarkers) { this.linkmarkers = linkmarkers; }

    public CardPrices getPrices() { return prices; }
    public void setPrices(CardPrices prices) { this.prices = prices; }

    public List<CardSetInfo> getCardSets() { return cardSets; }
    public void setCardSets(List<CardSetInfo> cardSets) { this.cardSets = cardSets; }

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
