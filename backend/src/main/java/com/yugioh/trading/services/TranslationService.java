package com.yugioh.trading.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class TranslationService {

    private final RestTemplate restTemplate;
    private boolean quotaExceeded = false;

    public TranslationService() {
        this.restTemplate = new RestTemplate();
    }

    public String translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty() || quotaExceeded) {
            return null;
        }

        try {
            String url = "https://api.mymemory.translated.net/get?q={q}&langpair={langpair}";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class, text, sourceLang + "|" + targetLang);

            if (response != null && response.containsKey("responseData")) {
                Map<String, Object> responseData = (Map<String, Object>) response.get("responseData");
                if (responseData != null && responseData.containsKey("translatedText")) {
                    String translated = (String) responseData.get("translatedText");
                    
                    if (translated != null && translated.toUpperCase().contains("MYMEMORY WARNING")) {
                        System.out.println("Cota da API de Tradução atingida. Parando traduções automáticas.");
                        quotaExceeded = true;
                        return null;
                    }
                    return translated;
                }
            }
        } catch (Exception e) {
            if (e.getMessage().contains("429")) {
                System.out.println("Erro 429: Cota de Tradução atingida. Parando traduções.");
                quotaExceeded = true;
            } else {
                System.err.println("Translation failed for text: '" + text + "' - " + e.getMessage());
            }
        }

        return null;
    }
}
