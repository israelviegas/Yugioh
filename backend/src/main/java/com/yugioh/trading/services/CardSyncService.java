package com.yugioh.trading.services;

import com.yugioh.trading.dto.YgoProDeckCard;
import com.yugioh.trading.dto.YgoProDeckResponse;
import com.yugioh.trading.models.Card;
import com.yugioh.trading.repositories.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CardSyncService {

    private final CardRepository cardRepository;
    private final TranslationService translationService;

    public CardSyncService(CardRepository cardRepository, TranslationService translationService) {
        this.cardRepository = cardRepository;
        this.translationService = translationService;
    }

    private String cleanText(String val, int maxLen) {
        if (val == null) return null;
        try {
            val = java.net.URLDecoder.decode(val, java.nio.charset.StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            // Ignorar erro de decode
        }
        if (val.length() > maxLen) {
            val = val.substring(0, maxLen);
        }
        return val;
    }

    public void syncCards() {
        System.out.println("Iniciando a sincronização de cartas...");
        RestTemplate restTemplate = new RestTemplate();
        String urlEn = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
        String urlPt = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=pt";
        String urlJa = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=ja";

        Map<Long, YgoProDeckCard> ptMap = new HashMap<>();
        try {
            System.out.println("Sincronização: Baixando cartas em Português...");
            YgoProDeckResponse responsePt = restTemplate.getForObject(urlPt, YgoProDeckResponse.class);
            if (responsePt != null && responsePt.getData() != null) {
                for (YgoProDeckCard c : responsePt.getData()) {
                    ptMap.put(c.getId(), c);
                }
            }
        } catch (Exception e) {
            System.err.println("Sincronização: Aviso ao buscar cartas em PT: " + e.getMessage());
        }

        Map<Long, YgoProDeckCard> jaMap = new HashMap<>();
        try {
            System.out.println("Sincronização: Baixando cartas em Japonês...");
            YgoProDeckResponse responseJa = restTemplate.getForObject(urlJa, YgoProDeckResponse.class);
            if (responseJa != null && responseJa.getData() != null) {
                for (YgoProDeckCard c : responseJa.getData()) {
                    jaMap.put(c.getId(), c);
                }
            }
        } catch (Exception e) {
            System.err.println("Sincronização: Aviso ao buscar cartas em JA: " + e.getMessage());
        }

        List<Long> existingIds = cardRepository.findAllIds();
        System.out.println("Sincronização: " + existingIds.size() + " cartas já existem no banco.");

        try {
            System.out.println("Sincronização: Baixando cartas em Inglês...");
            YgoProDeckResponse responseEn = restTemplate.getForObject(urlEn, YgoProDeckResponse.class);
            if (responseEn != null && responseEn.getData() != null) {
                List<Card> cardsToSave = new ArrayList<>();
                int newCardsCount = 0;

                for (YgoProDeckCard apiCardEn : responseEn.getData()) {
                    if (existingIds.contains(apiCardEn.getId())) {
                        continue; // Skip cards we already have
                    }

                    newCardsCount++;
                    Card card = new Card();
                    card.setId(apiCardEn.getId());
                    card.setName(cleanText(apiCardEn.getName(), 255));
                    card.setType(apiCardEn.getType());
                    card.setDescription(cleanText(apiCardEn.getDesc(), 1990));
                    card.setAttack(apiCardEn.getAtk());
                    card.setDefense(apiCardEn.getDef());
                    card.setLevel(apiCardEn.getLevel());
                    card.setAttribute(apiCardEn.getAttribute());
                    card.setFrameType(apiCardEn.getFrameType());
                    card.setRace(apiCardEn.getRace());
                    card.setArchetype(apiCardEn.getArchetype());
                    card.setScale(apiCardEn.getScale());
                    card.setLinkval(apiCardEn.getLinkval());
                    
                    if (apiCardEn.getLinkmarkers() != null && !apiCardEn.getLinkmarkers().isEmpty()) {
                        card.setLinkmarkers(new ArrayList<>(apiCardEn.getLinkmarkers()));
                    }

                    if (apiCardEn.getCard_prices() != null && !apiCardEn.getCard_prices().isEmpty()) {
                        YgoProDeckCard.ApiCardPrice apiPrice = apiCardEn.getCard_prices().get(0);
                        com.yugioh.trading.models.CardPrices prices = new com.yugioh.trading.models.CardPrices();
                        prices.setCardmarketPrice(apiPrice.getCardmarket_price());
                        prices.setTcgplayerPrice(apiPrice.getTcgplayer_price());
                        prices.setEbayPrice(apiPrice.getEbay_price());
                        prices.setAmazonPrice(apiPrice.getAmazon_price());
                        prices.setCoolstuffincPrice(apiPrice.getCoolstuffinc_price());
                        card.setPrices(prices);
                    }

                    if (apiCardEn.getCard_sets() != null && !apiCardEn.getCard_sets().isEmpty()) {
                        List<com.yugioh.trading.models.CardSetInfo> sets = apiCardEn.getCard_sets().stream().map(apiSet -> {
                            com.yugioh.trading.models.CardSetInfo info = new com.yugioh.trading.models.CardSetInfo();
                            info.setSetName(cleanText(apiSet.getSet_name(), 255));
                            info.setSetCode(apiSet.getSet_code());
                            info.setSetRarity(apiSet.getSet_rarity());
                            info.setSetRarityCode(apiSet.getSet_rarity_code());
                            info.setSetPrice(apiSet.getSet_price());
                            return info;
                        }).collect(Collectors.toList());
                        card.setCardSets(sets);
                    }

                    if (apiCardEn.getCard_images() != null && !apiCardEn.getCard_images().isEmpty()) {
                        card.setImageUrl(apiCardEn.getCard_images().get(0).getImage_url());
                    }

                    // PT-BR Data
                    YgoProDeckCard apiCardPt = ptMap.get(apiCardEn.getId());
                    if (apiCardPt != null) {
                        card.setNamePt(cleanText(apiCardPt.getName(), 255));
                        card.setDescriptionPt(cleanText(apiCardPt.getDesc(), 1990));
                        card.setTranslatedBySystem(false);
                        if (apiCardPt.getCard_images() != null && !apiCardPt.getCard_images().isEmpty()) {
                            card.setImageUrlPt(apiCardPt.getCard_images().get(0).getImage_url());
                        } else {
                            card.setImageUrlPt("https://images.ygoprodeck.com/images/cards/pt/" + apiCardEn.getId() + ".jpg");
                        }
                    } else {
                        card.setNamePt(cleanText(apiCardEn.getName() + " (PT-BR)", 255));
                        card.setDescriptionPt(cleanText(apiCardEn.getDesc(), 1990));
                        card.setTranslatedBySystem(false);
                        card.setImageUrlPt("https://images.ygoprodeck.com/images/cards/pt/" + apiCardEn.getId() + ".jpg");
                    }

                    // JA Data
                    YgoProDeckCard apiCardJa = jaMap.get(apiCardEn.getId());
                    if (apiCardJa != null) {
                        card.setNameJa(cleanText(apiCardJa.getName(), 255));
                        card.setDescriptionJa(cleanText(apiCardJa.getDesc(), 1990));
                    } else {
                        card.setNameJa(cleanText(apiCardEn.getName() + " (JP)", 255));
                        card.setDescriptionJa(cleanText(apiCardEn.getDesc(), 1990));
                    }
                    card.setImageUrlJa("https://images.ygoprodeck.com/images/cards/ja/" + apiCardEn.getId() + ".jpg");

                    cardsToSave.add(card);
                    
                    if (cardsToSave.size() >= 200) {
                        cardRepository.saveAll(cardsToSave);
                        cardsToSave.clear();
                        System.out.println("Sincronização: Salvo lote de 200 novas cartas...");
                    }
                }
                
                if (!cardsToSave.isEmpty()) {
                    cardRepository.saveAll(cardsToSave);
                }
                System.out.println("Sincronização finalizada! " + newCardsCount + " novas cartas foram adicionadas ao banco.");
            }
        } catch (Exception e) {
            System.err.println("Erro durante a sincronização de cartas: " + e.getMessage());
        }
    }

}
