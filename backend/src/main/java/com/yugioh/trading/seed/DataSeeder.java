package com.yugioh.trading.seed;

import com.yugioh.trading.dto.YgoProDeckCard;
import com.yugioh.trading.dto.YgoProDeckResponse;
import com.yugioh.trading.models.*;
import com.yugioh.trading.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.yugioh.trading.services.TranslationService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final UserCardRepository userCardRepository;
    private final StrategyRepository strategyRepository;
    private final TranslationService translationService;

    public DataSeeder(CardRepository cardRepository, UserRepository userRepository,
                      UserCardRepository userCardRepository, StrategyRepository strategyRepository,
                      TranslationService translationService) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
        this.strategyRepository = strategyRepository;
        this.translationService = translationService;
    }

    @Override
    public void run(String... args) throws Exception {
        new Thread(() -> {
            if (cardRepository.count() == 0) {
                seedCards();
            }
            if (userRepository.count() == 0) {
                seedUsersAndStrategies();
            }
        }).start();
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return null;
        if (val.length() <= maxLen) return val;
        return val.substring(0, maxLen);
    }

    @Transactional
    protected void seedCards() {
        System.out.println("Iniciando a importação das cartas (pode demorar alguns segundos)...");
        RestTemplate restTemplate = new RestTemplate();
        String urlEn = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
        String urlPt = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=pt";

        Map<Long, YgoProDeckCard> ptMap = new HashMap<>();
        try {
            System.out.println("Baixando cartas em Português...");
            YgoProDeckResponse responsePt = restTemplate.getForObject(urlPt, YgoProDeckResponse.class);
            if (responsePt != null && responsePt.getData() != null) {
                for (YgoProDeckCard c : responsePt.getData()) {
                    ptMap.put(c.getId(), c);
                }
            }
            System.out.println("Download em Português concluído.");
        } catch (Exception e) {
            System.err.println("Aviso ao buscar cartas em PT: " + e.getMessage());
        }

        // Japanese map for famous staple cards
        Map<Long, String[]> jaMap = getJapaneseMap();

        try {
            System.out.println("Baixando cartas em Inglês...");
            YgoProDeckResponse responseEn = restTemplate.getForObject(urlEn, YgoProDeckResponse.class);
            if (responseEn != null && responseEn.getData() != null) {
                System.out.println("Processando dados e salvando no banco de dados...");
                List<Card> cardsToSave = new ArrayList<>();
                for (int i = 0; i < responseEn.getData().size(); i++) {
                    YgoProDeckCard apiCardEn = responseEn.getData().get(i);
                    Card card = new Card();
                    card.setId(apiCardEn.getId());
                    card.setName(apiCardEn.getName());
                    card.setType(apiCardEn.getType());
                    card.setDescription(truncate(apiCardEn.getDesc(), 1990));
                    card.setAttack(apiCardEn.getAtk());
                    card.setDefense(apiCardEn.getDef());
                    card.setLevel(apiCardEn.getLevel());
                    card.setAttribute(apiCardEn.getAttribute());
                    if (apiCardEn.getCard_images() != null && !apiCardEn.getCard_images().isEmpty()) {
                        card.setImageUrl(apiCardEn.getCard_images().get(0).getImage_url());
                    }

                    // PT-BR Data
                    YgoProDeckCard apiCardPt = ptMap.get(apiCardEn.getId());
                    if (apiCardPt != null) {
                        card.setNamePt(apiCardPt.getName());
                        card.setDescriptionPt(truncate(apiCardPt.getDesc(), 1990));
                        card.setTranslatedBySystem(false);
                        if (apiCardPt.getCard_images() != null && !apiCardPt.getCard_images().isEmpty()) {
                            card.setImageUrlPt(apiCardPt.getCard_images().get(0).getImage_url());
                        } else {
                            card.setImageUrlPt("https://images.ygoprodeck.com/images/cards/pt/" + apiCardEn.getId() + ".jpg");
                        }
                    } else {
                        System.out.println("Traduzindo carta: " + apiCardEn.getName());
                        String translatedName = translationService.translate(apiCardEn.getName(), "en", "pt-BR");
                        String translatedDesc = translationService.translate(apiCardEn.getDesc(), "en", "pt-BR");
                        
                        if (translatedName != null && translatedDesc != null) {
                            card.setNamePt(translatedName);
                            card.setDescriptionPt(truncate(translatedDesc, 1990));
                            card.setTranslatedBySystem(true);
                        } else {
                            card.setNamePt(apiCardEn.getName());
                            card.setDescriptionPt(truncate(apiCardEn.getDesc(), 1990));
                            card.setTranslatedBySystem(false);
                        }
                        card.setImageUrlPt("https://images.ygoprodeck.com/images/cards/pt/" + apiCardEn.getId() + ".jpg");
                    }

                    // JA Data
                    String[] jaData = jaMap.get(apiCardEn.getId());
                    if (jaData != null) {
                        card.setNameJa(jaData[0]);
                        card.setDescriptionJa(truncate(jaData[1], 1990));
                    } else {
                        card.setNameJa(apiCardEn.getName() + " (JP)");
                        card.setDescriptionJa(truncate(apiCardEn.getDesc(), 1990));
                    }
                    card.setImageUrlJa("https://images.ygoprodeck.com/images/cards/ja/" + apiCardEn.getId() + ".jpg");

                    cardsToSave.add(card);
                    
                    if (cardsToSave.size() >= 200) {
                        cardRepository.saveAll(cardsToSave);
                        cardsToSave.clear();
                        System.out.println("Salvo lote de 200 cartas...");
                    }
                }
                
                if (!cardsToSave.isEmpty()) {
                    cardRepository.saveAll(cardsToSave);
                }
                System.out.println("Importação de cartas finalizada!");
            }
        } catch (Exception e) {
            System.err.println("Erro ao popular cartas: " + e.getMessage());
        }
    }

    private Map<Long, String[]> getJapaneseMap() {
        Map<Long, String[]> map = new HashMap<>();
        // Dark Magician
        map.put(46986414L, new String[]{"ブラック・マジシャン", "魔法使いの究極の力。攻撃と守備において最強レベル。"});
        // Blue-Eyes White Dragon
        map.put(89631139L, new String[]{"青眼の白龍", "高い攻撃力を誇る伝説のドラゴン。どんな相手でも粉砕する。"});
        // Monster Reborn
        map.put(83764718L, new String[]{"死者蘇生", "自分または相手の墓地からモンスター１体を選び、自分フィールドに特殊召喚する。"});
        // Ash Blossom
        map.put(14558127L, new String[]{"灰流うらら", "デッキからカードを手札に加える効果を含む魔法・罠・モンスターの効果が発動した時に発動できる。その効果を無効にする。"});
        // Red-Eyes Black Dragon
        map.put(74677422L, new String[]{"真紅眼の黒竜", "真紅の眼を持つ黒竜。怒りの黒い炎はその眼に映る者全てを焼き尽くす。"});
        // Mystical Space Typhoon
        map.put(5318639L, new String[]{"サイクロン", "フィールドの魔法・罠カード１枚を対象として発動できる。そのカードを破壊する。"});
        // Upstart Goblin
        map.put(70368879L, new String[]{"成金ゴブリン", "相手は１０００ＬＰ回復する。その後、自分はデッキから１枚ドローする。"});
        // Dark Hole
        map.put(53129443L, new String[]{"ブラック・ホール", "フィールドのモンスターを全て破壊する。"});
        // Polymerization
        map.put(24094653L, new String[]{"融合", "自分の手札・フィールドから、融合モンスターカードによって決められた融合素材モンスターを墓地へ送り、その融合モンスター１体をＥＸデッキから融合召喚する。"});
        // Solemn Judgment
        map.put(41420027L, new String[]{"神の宣告", "ＬＰを半分払って発動できる。魔法・罠カードの発動、またはモンスターの召喚・反転召喚・特殊召喚を無効にし破壊する。"});
        // Pot of Greed
        map.put(55144522L, new String[]{"強欲な壺", "自分のデッキからカードを２枚ドローする。"});
        // Harpie's Feather Duster
        map.put(18144506L, new String[]{"ハーピィの羽根帚", "相手フィールドの魔法・罠カードを全て破壊する。"});
        // Raigeki
        map.put(12580477L, new String[]{"サンダー・ボルト", "相手フィールドのモンスターを全て破壊する。"});
        // Mirror Force
        map.put(44095762L, new String[]{"聖なるバリア －ミラーフォース－", "相手モンスターの攻撃宣言時に発動できる。相手フィールドの攻撃表示モンスターを全て破壊する。"});
        // Call of the Haunted
        map.put(97077563L, new String[]{"リビングデッドの呼び声", "自分の墓地のモンスター１体を対象として発動できる。そのモンスターを攻撃表示で特殊召喚する。"});
        // Torrential Tribute
        map.put(53582587L, new String[]{"激流葬", "モンスターが召喚・反転召喚・特殊召喚された時に発動できる。フィールドのモンスターを全て破壊する。"});
        // Infinite Impermanence
        map.put(10045474L, new String[]{"無限泡影", "相手フィールドの表側表示モンスター１体を対象として発動できる。そのモンスターの効果をターン終了時まで無効にする。"});
        // Effect Veiler
        map.put(97268402L, new String[]{"エフェクト・ヴェーラー", "相手メインフェイズにこのカードを手札から墓地へ送り、相手フィールドの表側表示モンスター１体を対象として発動できる。その相手モンスターの効果をターン終了時まで無効にする。"});
        // Forbidden Droplet
        map.put(24299458L, new String[]{"禁じられた一滴", "自分の手札・フィールドからカードを任意の数だけ墓地へ送り、その数だけ相手フィールドの表側表示モンスターを対象として発動できる。そのモンスターの攻撃力は半分になり、効果は無効化される。"});
        // Nibiru, the Primal Being
        map.put(27204311L, new String[]{"原始生命態ニビル", "相手が５体以上のモンスターを召喚・特殊召喚したターンのメインフェイズに発動できる。フィールドの表側表示モンスターを全てリリースし、このカードを手札から特殊召喚する。"});
        return map;
    }

    private void seedUsersAndStrategies() {
        User yugi = new User();
        yugi.setUsername("Yugi Muto");
        yugi.setEmail("yugi@kaibacorp.com");
        yugi.setPassword("heartofthecards");
        yugi.setRole("USER");
        userRepository.save(yugi);

        User kaiba = new User();
        kaiba.setUsername("Seto Kaiba");
        kaiba.setEmail("seto@kaibacorp.com");
        kaiba.setPassword("bluedragon");
        kaiba.setRole("USER");
        userRepository.save(kaiba);

        // Seed algumas cartas para os usuários
        List<Card> allCards = cardRepository.findAll();
        if (allCards.size() >= 10) {
            // Yugi cards
            UserCard uc1 = new UserCard(); uc1.setUser(yugi); uc1.setCard(allCards.get(0)); uc1.setStatus("FOR_SALE"); uc1.setPrice(150.0); userCardRepository.save(uc1);
            UserCard uc2 = new UserCard(); uc2.setUser(yugi); uc2.setCard(allCards.get(1)); uc2.setStatus("FOR_SALE"); uc2.setPrice(80.50); userCardRepository.save(uc2);
            UserCard uc3 = new UserCard(); uc3.setUser(yugi); uc3.setCard(allCards.get(2)); uc3.setStatus("FOR_TRADE"); uc3.setPrice(0.0); userCardRepository.save(uc3);
            UserCard uc4 = new UserCard(); uc4.setUser(yugi); uc4.setCard(allCards.get(3)); uc4.setStatus("FOR_TRADE"); uc4.setPrice(0.0); userCardRepository.save(uc4);
            UserCard uc5 = new UserCard(); uc5.setUser(yugi); uc5.setCard(allCards.get(4)); uc5.setStatus("COLLECTION"); uc5.setPrice(0.0); userCardRepository.save(uc5);

            // Kaiba cards
            UserCard uc6 = new UserCard(); uc6.setUser(kaiba); uc6.setCard(allCards.get(5)); uc6.setStatus("FOR_SALE"); uc6.setPrice(300.0); userCardRepository.save(uc6);
            UserCard uc7 = new UserCard(); uc7.setUser(kaiba); uc7.setCard(allCards.get(6)); uc7.setStatus("FOR_SALE"); uc7.setPrice(250.0); userCardRepository.save(uc7);
            UserCard uc8 = new UserCard(); uc8.setUser(kaiba); uc8.setCard(allCards.get(7)); uc8.setStatus("FOR_TRADE"); uc8.setPrice(0.0); userCardRepository.save(uc8);
            UserCard uc9 = new UserCard(); uc9.setUser(kaiba); uc9.setCard(allCards.get(8)); uc9.setStatus("FOR_TRADE"); uc9.setPrice(0.0); userCardRepository.save(uc9);
            UserCard uc10 = new UserCard(); uc10.setUser(kaiba); uc10.setCard(allCards.get(9)); uc10.setStatus("COLLECTION"); uc10.setPrice(0.0); userCardRepository.save(uc10);
        } else if (!allCards.isEmpty()) {
            UserCard uc1 = new UserCard(); uc1.setUser(yugi); uc1.setCard(allCards.get(0)); uc1.setStatus("FOR_SALE"); uc1.setPrice(100.50); userCardRepository.save(uc1);
            if (allCards.size() > 1) {
                UserCard uc2 = new UserCard(); uc2.setUser(kaiba); uc2.setCard(allCards.get(1)); uc2.setStatus("FOR_TRADE"); uc2.setPrice(0.0); userCardRepository.save(uc2);
            }
        }

        Strategy s1 = new Strategy();
        s1.setAuthor(yugi);
        s1.setTitle("The Power of Friendship and the Heart of the Cards");
        s1.setContent("The best strategy is to believe in your deck. No matter the situation, the right card will come at the right time!");
        s1.setTitleEn("The Power of Friendship and the Heart of the Cards");
        s1.setContentEn("The best strategy is to believe in your deck. No matter the situation, the right card will come at the right time!");
        s1.setTitlePt("O poder da amizade e o coração das cartas");
        s1.setContentPt("A melhor estratégia é acreditar no seu deck. Não importa a situação, a carta certa virá no momento certo!");
        s1.setTitleJa("友情の力とカードの心");
        s1.setContentJa("最高の戦略は自分のデッキを信じることだ。どんな状況であっても、正しいカードは正しいタイミングでやってくる！");
        strategyRepository.save(s1);
    }
}
