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
    private final TradeRepository tradeRepository;
    private final MessageRepository messageRepository;

    public DataSeeder(CardRepository cardRepository, UserRepository userRepository,
                      UserCardRepository userCardRepository, StrategyRepository strategyRepository,
                      CardSyncService cardSyncService, CardConditionRepository cardConditionRepository,
                      TradeRepository tradeRepository, MessageRepository messageRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.userCardRepository = userCardRepository;
        this.strategyRepository = strategyRepository;
        this.cardSyncService = cardSyncService;
        this.cardConditionRepository = cardConditionRepository;
        this.tradeRepository = tradeRepository;
        this.messageRepository = messageRepository;
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

            // Sync cards on startup only if database is empty to speed up dev cycles
            if (cardRepository.count() == 0) {
                cardSyncService.syncCards();
            }
            
            if (userRepository.count() == 0) {
                seedUsersAndStrategies();
            }

            userRepository.findByEmail("israel.viegas@gmail.com").ifPresentOrElse(
                israel -> {
                    if ("israel.viegas@gmail.com".equals(israel.getUsername()) || israel.getUsername() == null || israel.getUsername().isEmpty()) {
                        israel.setUsername("Israel Viegas");
                        userRepository.save(israel);
                    }
                },
                () -> {
                    User israel = new User();
                    israel.setUsername("Israel Viegas");
                    israel.setEmail("israel.viegas@gmail.com"); // Login via email
                    israel.setPassword("viegas");
                    israel.setRole("ADMIN");
                    userRepository.save(israel);
                }
            );

            // Populate random proposals
            seedRandomProposals();
        }).start();
    }

    private void seedRandomProposals() {
        // Obter usuarios
        User israel = userRepository.findByEmail("israel.viegas@gmail.com").orElse(null);
        User yugi = userRepository.findByEmail("yugi@kaibacorp.com").orElse(null);
        User kaiba = userRepository.findByEmail("seto@kaibacorp.com").orElse(null);

        if (israel == null || yugi == null || kaiba == null) return;

        if (userCardRepository.count() > 0) return;

        List<Card> allCards = cardRepository.findAll();
        if (allCards.size() < 10) return;

        java.util.Random rand = new java.util.Random();
        List<CardCondition> conditions = cardConditionRepository.findAll();

        User[] users = {israel, yugi, kaiba};

        for (User u : users) {
            for (int i = 0; i < 5; i++) {
                UserCard uc = new UserCard();
                uc.setUser(u);
                uc.setCard(allCards.get(rand.nextInt(Math.min(50, allCards.size()))));
                uc.setCondition(conditions.get(rand.nextInt(conditions.size())));
                uc.setStatus("COLLECTION"); // Apenas na coleção, sem vendas ou trocas automáticas
                userCardRepository.save(uc);
            }
        }
        System.out.println("Sincronização: Cartas dos usuários inicializadas em COLLECTION (sem ofertas/propostas automáticas).");
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

        // Cartas foram removidas do seeder a pedido do usuário

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
