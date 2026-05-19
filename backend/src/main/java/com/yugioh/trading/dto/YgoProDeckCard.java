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

    public List<CardImage> getCard_images() { return card_images; }
    public void setCard_images(List<CardImage> card_images) { this.card_images = card_images; }

    public static class CardImage {
        private String image_url;

        public String getImage_url() { return image_url; }
        public void setImage_url(String image_url) { this.image_url = image_url; }
    }
}
