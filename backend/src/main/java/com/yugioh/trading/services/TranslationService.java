package com.yugioh.trading.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private boolean quotaExceeded = false;
    private long quotaResetTime = 0;

    public TranslationService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String translate(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        if (quotaExceeded && System.currentTimeMillis() < quotaResetTime) {
            return fallbackTranslate(text, sourceLang, targetLang);
        } else if (quotaExceeded) {
            quotaExceeded = false; // Tentar novamente
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            String prompt = String.format(
                "Translate the following Yu-Gi-Oh! card text from %s to %s. " +
                "Maintain the specific game terminology (e.g., Special Summon, Graveyard, Tribute, etc). " +
                "Return ONLY the translated text without any quotes, explanations, or markdown formatting.\n\nText: %s", 
                sourceLang, targetLang, text
            );

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    if (candidate.containsKey("content")) {
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap.containsKey("parts")) {
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                            if (!parts.isEmpty()) {
                                return (String) parts.get(0).get("text");
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                System.out.println("Erro 429: Cota de Tradução do Gemini atingida (5 RPM). Usando fallback gratuito por 1 minuto.");
                quotaExceeded = true;
                quotaResetTime = System.currentTimeMillis() + 60000; // 1 minute
                return fallbackTranslate(text, sourceLang, targetLang);
            } else {
                System.err.println("Translation failed for text: '" + text + "' - " + e.getMessage());
            }
        }

        return null;
    }

    private String fallbackTranslate(String text, String sourceLang, String targetLang) {
        try {
            String tl = targetLang.equals("pt-BR") ? "pt" : targetLang;
            String encodedText = java.net.URLEncoder.encode(text, "UTF-8");
            String url = String.format("https://translate.googleapis.com/translate_a/single?client=gtx&sl=%s&tl=%s&dt=t&q=%s", sourceLang, tl, encodedText);
            
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (response.getBody() != null && !response.getBody().isEmpty()) {
                List<List<Object>> parts = (List<List<Object>>) response.getBody().get(0);
                StringBuilder translated = new StringBuilder();
                for (List<Object> part : parts) {
                    if (part.get(0) != null) {
                        translated.append((String) part.get(0));
                    }
                }
                return translated.toString();
            }
        } catch (Exception e) {
            System.err.println("Fallback translation failed: " + e.getMessage());
        }
        return null;
    }
}
