package com.yugioh.trading.seed;

import com.yugioh.trading.dto.YgoProDeckCard;
import com.yugioh.trading.dto.YgoProDeckResponse;
import com.yugioh.trading.models.*;
import com.yugioh.trading.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.yugioh.trading.services.CardSyncService;

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
    private final CardSyncService cardSyncService;
    private final CardConditionRepository cardConditionRepository;

    public DataSeeder(CardRepository cardRepository, UserRepository userRepository,
                      UserCardRepository userCardRepository, StrategyRepository strategyRepository,
                      CardSyncService cardSyncService, CardConditionRepository cardConditionRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
        this.strategyRepository = strategyRepository;
        this.cardSyncService = cardSyncService;
        this.cardConditionRepository = cardConditionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        new Thread(() -> {
            if (cardConditionRepository.count() == 0) {
                java.util.List<CardCondition> conditions = java.util.Arrays.asList(
                    new CardCondition("NM", "Near Mint", "Quase Nova", "ニアミント"),
                    new CardCondition("LP", "Lightly Played", "Levemente Usada", "プレイド（軽度）"),
                    new CardCondition("MP", "Moderately Played", "Usada", "プレイド（中度）"),
                    new CardCondition("HP", "Heavily Played", "Muito Gasta", "プレイド（重度）"),
                    new CardCondition("DMG", "Damaged", "Danificada", "ダメージ")
                );
                cardConditionRepository.saveAll(conditions);
                System.out.println("Sincronização: Condições de cartas (NM, LP, etc) salvas.");
            }

            // Always try to sync cards on startup, it will skip existing ones
            cardSyncService.syncCards();
            
            if (userRepository.count() == 0) {
                seedUsersAndStrategies();
            }

            if (userRepository.findByEmail("israel.viegas@gmail.com").isEmpty()) {
                User israel = new User();
                israel.setUsername("israel.viegas@gmail.com");
                israel.setEmail("israel.viegas@gmail.com"); // Login via email
                israel.setPassword("viegas");
                israel.setRole("ADMIN");
                userRepository.save(israel);
            }
        }).start();
    }

    private void seedUsersAndStrategies() {
        User yugi = new User();
        yugi.setUsername("Yugi Muto");
        yugi.setEmail("yugi@kaibacorp.com");
        yugi.setPassword("heartofthecards");
        yugi.setRole("ADMIN");
        userRepository.save(yugi);

        User kaiba = new User();
        kaiba.setUsername("Seto Kaiba");
        kaiba.setEmail("seto@kaibacorp.com");
        kaiba.setPassword("bluedragon");
        kaiba.setRole("USER");
        userRepository.save(kaiba);

        // Seed algumas cartas para os usuários
        List<Card> allCards = cardRepository.findAll();
        CardCondition nm = cardConditionRepository.findById("NM").orElse(null);
        CardCondition mp = cardConditionRepository.findById("MP").orElse(null);

        if (allCards.size() >= 10) {
            // Yugi cards
            UserCard uc1 = new UserCard(); uc1.setUser(yugi); uc1.setCard(allCards.get(0)); uc1.setStatus("FOR_SALE"); uc1.setPrice(150.0); uc1.setCondition(nm); userCardRepository.save(uc1);
            UserCard uc2 = new UserCard(); uc2.setUser(yugi); uc2.setCard(allCards.get(1)); uc2.setStatus("FOR_SALE"); uc2.setPrice(80.50); uc2.setCondition(mp); userCardRepository.save(uc2);
            UserCard uc3 = new UserCard(); uc3.setUser(yugi); uc3.setCard(allCards.get(2)); uc3.setStatus("FOR_TRADE"); uc3.setPrice(0.0); uc3.setCondition(nm); userCardRepository.save(uc3);
            UserCard uc4 = new UserCard(); uc4.setUser(yugi); uc4.setCard(allCards.get(3)); uc4.setStatus("FOR_TRADE"); uc4.setPrice(0.0); uc4.setCondition(nm); userCardRepository.save(uc4);
            UserCard uc5 = new UserCard(); uc5.setUser(yugi); uc5.setCard(allCards.get(4)); uc5.setStatus("COLLECTION"); uc5.setPrice(0.0); uc5.setCondition(nm); userCardRepository.save(uc5);

            // Kaiba cards
            UserCard uc6 = new UserCard(); uc6.setUser(kaiba); uc6.setCard(allCards.get(5)); uc6.setStatus("FOR_SALE"); uc6.setPrice(300.0); uc6.setCondition(nm); userCardRepository.save(uc6);
            UserCard uc7 = new UserCard(); uc7.setUser(kaiba); uc7.setCard(allCards.get(6)); uc7.setStatus("FOR_SALE"); uc7.setPrice(250.0); uc7.setCondition(nm); userCardRepository.save(uc7);
            UserCard uc8 = new UserCard(); uc8.setUser(kaiba); uc8.setCard(allCards.get(7)); uc8.setStatus("FOR_TRADE"); uc8.setPrice(0.0); uc8.setCondition(mp); userCardRepository.save(uc8);
            UserCard uc9 = new UserCard(); uc9.setUser(kaiba); uc9.setCard(allCards.get(8)); uc9.setStatus("FOR_TRADE"); uc9.setPrice(0.0); uc9.setCondition(mp); userCardRepository.save(uc9);
            UserCard uc10 = new UserCard(); uc10.setUser(kaiba); uc10.setCard(allCards.get(9)); uc10.setStatus("COLLECTION"); uc10.setPrice(0.0); uc10.setCondition(nm); userCardRepository.save(uc10);
        } else if (!allCards.isEmpty()) {
            UserCard uc1 = new UserCard(); uc1.setUser(yugi); uc1.setCard(allCards.get(0)); uc1.setStatus("FOR_SALE"); uc1.setPrice(100.50); uc1.setCondition(nm); userCardRepository.save(uc1);
            if (allCards.size() > 1) {
                UserCard uc2 = new UserCard(); uc2.setUser(kaiba); uc2.setCard(allCards.get(1)); uc2.setStatus("FOR_TRADE"); uc2.setPrice(0.0); uc2.setCondition(nm); userCardRepository.save(uc2);
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
