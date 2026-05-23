package com.yugioh.trading.dto;

import java.util.List;

public class YgoProDeckCard {
    private Long id;
    private String name;
    private String type;
    private String desc;
    private Integer atk;
    private Integer def;
    private Integer level;
    private String attribute;
    private String frameType;
    private String race;
    private String archetype;
    private Integer scale;
    private Integer linkval;
    private List<String> linkmarkers;
    private List<ApiCardSet> card_sets;
    private List<ApiCardPrice> card_prices;
    private List<CardImage> card_images;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public Integer getAtk() { return atk; }
    public void setAtk(Integer atk) { this.atk = atk; }

    public Integer getDef() { return def; }
    public void setDef(Integer def) { this.def = def; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getAttribute() { return attribute; }
    public void setAttribute(String attribute) { this.attribute = attribute; }

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

    public List<ApiCardSet> getCard_sets() { return card_sets; }
    public void setCard_sets(List<ApiCardSet> card_sets) { this.card_sets = card_sets; }

    public List<ApiCardPrice> getCard_prices() { return card_prices; }
    public void setCard_prices(List<ApiCardPrice> card_prices) { this.card_prices = card_prices; }

    public List<CardImage> getCard_images() { return card_images; }
    public void setCard_images(List<CardImage> card_images) { this.card_images = card_images; }

    public static class CardImage {
        private String image_url;

        public String getImage_url() { return image_url; }
        public void setImage_url(String image_url) { this.image_url = image_url; }
    }

    public static class ApiCardSet {
        private String set_name;
        private String set_code;
        private String set_rarity;
        private String set_rarity_code;
        private String set_price;

        public String getSet_name() { return set_name; }
        public void setSet_name(String set_name) { this.set_name = set_name; }
        public String getSet_code() { return set_code; }
        public void setSet_code(String set_code) { this.set_code = set_code; }
        public String getSet_rarity() { return set_rarity; }
        public void setSet_rarity(String set_rarity) { this.set_rarity = set_rarity; }
        public String getSet_rarity_code() { return set_rarity_code; }
        public void setSet_rarity_code(String set_rarity_code) { this.set_rarity_code = set_rarity_code; }
        public String getSet_price() { return set_price; }
        public void setSet_price(String set_price) { this.set_price = set_price; }
    }

    public static class ApiCardPrice {
        private String cardmarket_price;
        private String tcgplayer_price;
        private String ebay_price;
        private String amazon_price;
        private String coolstuffinc_price;

        public String getCardmarket_price() { return cardmarket_price; }
        public void setCardmarket_price(String cardmarket_price) { this.cardmarket_price = cardmarket_price; }
        public String getTcgplayer_price() { return tcgplayer_price; }
        public void setTcgplayer_price(String tcgplayer_price) { this.tcgplayer_price = tcgplayer_price; }
        public String getEbay_price() { return ebay_price; }
        public void setEbay_price(String ebay_price) { this.ebay_price = ebay_price; }
        public String getAmazon_price() { return amazon_price; }
        public void setAmazon_price(String amazon_price) { this.amazon_price = amazon_price; }
        public String getCoolstuffinc_price() { return coolstuffinc_price; }
        public void setCoolstuffinc_price(String coolstuffinc_price) { this.coolstuffinc_price = coolstuffinc_price; }
    }
}
