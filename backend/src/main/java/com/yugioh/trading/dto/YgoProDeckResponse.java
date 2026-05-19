package com.yugioh.trading.dto;

import java.util.List;

public class YgoProDeckResponse {
    private List<YgoProDeckCard> data;

    public List<YgoProDeckCard> getData() { return data; }
    public void setData(List<YgoProDeckCard> data) { this.data = data; }
}
