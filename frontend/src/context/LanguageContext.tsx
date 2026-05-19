'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt' | 'ja';

interface Translations {
  [key: string]: {
    en: string;
    pt: string;
    ja: string;
  };
}

const translations: Translations = {
  // Navbar
  nav_cards: { en: 'Cards', pt: 'Cartas', ja: 'カード' },
  nav_market: { en: 'Market', pt: 'Mercado', ja: 'マーケット' },
  nav_strategies: { en: 'Strategies', pt: 'Estratégias', ja: '戦略' },
  nav_login: { en: 'Login', pt: 'Entrar', ja: 'ログイン' },
  nav_logout: { en: 'Logout', pt: 'Sair', ja: 'ログアウト' },

  // Home
  home_hero_title: { en: 'THE ULTIMATE YU-GI-OH! TRADING HUB', pt: 'O MAIOR HUB DE TROCAS DE YU-GI-OH!', ja: '究極の遊戯王トレーディングハブ' },
  home_hero_subtitle: { en: 'Buy, sell, and trade legendary cards with duelists worldwide. Share winning strategies and become the King of Games.', pt: 'Compre, venda e troque cartas lendárias com duelistas de todo o mundo. Compartilhe estratégias e torne-se o Rei dos Jogos.', ja: '世界中のデュエリストと伝説のカードを売買・トレード。勝利の戦略を共有し、キング・オブ・ゲームズになろう。' },
  home_cta_explore: { en: 'Explore Database', pt: 'Explorar Catálogo', ja: 'データベースを探す' },
  home_cta_market: { en: 'Enter Marketplace', pt: 'Entrar no Mercado', ja: 'マーケットに入る' },
  home_feat1_title: { en: 'Card Database', pt: 'Banco de Cartas', ja: 'カードデータベース' },
  home_feat1_desc: { en: 'Explore over 10,000+ Yu-Gi-Oh! cards with complete stats, rulings, and high-resolution artworks.', pt: 'Explore mais de 10.000 cartas de Yu-Gi-Oh! com estatísticas completas, regras e artes em alta resolução.', ja: '10,000枚以上の遊戯王カードの詳細ステータス、裁定、高解像度アートワークを閲覧できます。' },
  home_feat2_title: { en: 'Marketplace', pt: 'Mercado de Duelistas', ja: 'マーケットプレイス' },
  home_feat2_desc: { en: 'List your rare cards for sale or set up secure trade proposals with other verified collectors.', pt: 'Anuncie suas cartas raras para venda ou crie propostas de troca seguras com outros colecionadores.', ja: 'レアカードを出品したり、他のコレクターと安全なトレード提案を行うことができます。' },
  home_feat3_title: { en: 'Strategy Guides', pt: 'Guias de Estratégia', ja: '戦略ガイド' },
  home_feat3_desc: { en: 'Master the meta. Read and share advanced deck breakdowns, combo guides, and tournament reports.', pt: 'Domine o meta. Leia e compartilhe análises de decks, guias de combos e relatórios de torneios.', ja: 'メタを制覇しよう。上級者のデッキ解説、コンボガイド、大会レポートを読んだり共有したりできます。' },

  // Cards
  cards_title: { en: 'Card Database', pt: 'Banco de Cartas', ja: 'カードデータベース' },
  search_placeholder: { en: 'Search by name...', pt: 'Buscar por nome...', ja: '名前で検索...' },
  cards_per_page: { en: 'Cards per page:', pt: 'Cartas por página:', ja: '表示件数:' },
  summoning_cards: { en: 'Summoning cards...', pt: 'Invocando cartas...', ja: 'カードを召喚中...' },
  no_image: { en: 'No Image', pt: 'Sem Imagem', ja: '画像なし' },
  prev: { en: 'Prev', pt: 'Anterior', ja: '前へ' },
  next: { en: 'Next', pt: 'Próxima', ja: '次へ' },
  all: { en: 'All', pt: 'Todas', ja: 'すべて' },

  // Marketplace
  market_title: { en: 'Marketplace Hub', pt: 'Centro de Mercado', ja: 'マーケットプレイスハブ' },
  search_market: { en: 'Search market...', pt: 'Buscar no mercado...', ja: '市場を検索...' },
  all_listings: { en: 'All Listings', pt: 'Todos os Anúncios', ja: 'すべての出品' },
  for_sale: { en: 'For Sale', pt: 'À Venda', ja: '販売中' },
  for_trade: { en: 'For Trade', pt: 'Para Troca', ja: 'トレード用' },
  listed_by: { en: 'Listed by:', pt: 'Anunciado por:', ja: '出品者:' },
  buy_now: { en: 'Buy Now', pt: 'Comprar Agora', ja: '今すぐ購入' },
  offer_trade: { en: 'Offer Trade', pt: 'Proposta de troca', ja: 'トレードを提案' },
  summoning_market: { en: 'Summoning market listings...', pt: 'Invocando ofertas do mercado...', ja: '市場の出品を召喚中...' },
  no_market_match: { en: 'No market listings match your criteria.', pt: 'Nenhum anúncio corresponde aos seus critérios.', ja: '条件に一致する出品がありません。' },

  // Strategies
  strat_title: { en: 'Duelist Strategies', pt: 'Estratégias de Duelistas', ja: 'デュエリストの戦略' },
  strat_share_btn: { en: '+ Share Your Strategy', pt: '+ Compartilhar Estratégia', ja: '+ 戦略を共有する' },
  strat_published: { en: 'Published by', pt: 'Publicado por', ja: '投稿者' },
  strat_summoning: { en: 'Summoning strategies...', pt: 'Invocando estratégias...', ja: '戦略を召喚中...' },
  strat_modal_title: { en: 'Share Your Dueling Strategy', pt: 'Compartilhe sua Estratégia de Duelo', ja: 'デュエル戦略を共有する' },
  strat_modal_label_title: { en: 'Strategy Title', pt: 'Título da Estratégia', ja: '戦略タイトル' },
  strat_modal_label_content: { en: 'Strategy Content / Guide', pt: 'Conteúdo / Guia da Estratégia', ja: '戦略の内容・ガイド' },
  strat_modal_label_video: { en: 'YouTube Video URL (Optional)', pt: 'URL do Vídeo no YouTube (Opcional)', ja: 'YouTube動画URL (任意)' },
  cancel: { en: 'Cancel', pt: 'Cancelar', ja: 'キャンセル' },
  publish: { en: 'Publish Strategy', pt: 'Publicar Estratégia', ja: '戦略を公開する' },

  // Profile
  prof_add_btn: { en: '+ Add Card to Inventory', pt: '+ Adicionar Carta ao Inventário', ja: '+ インベントリにカードを追加' },
  prof_all_cards: { en: 'All Cards', pt: 'Todas as Cartas', ja: 'すべてのカード' },
  prof_collection: { en: 'Collection', pt: 'Coleção', ja: 'コレクション' },
  prof_trade_offers: { en: 'Trade Offers', pt: 'Ofertas de Troca', ja: 'トレードオファー' },
  prof_loading: { en: 'Loading inventory...', pt: 'Carregando inventário...', ja: 'インベントリを読み込み中...' },
  prof_proposals_title: { en: 'Trade Proposals', pt: 'Propostas de Troca', ja: 'トレード提案' },
  prof_offered_cards: { en: 'Offered Cards', pt: 'Cartas Oferecidas', ja: '提供カード' },
  prof_requested_cards: { en: 'Requested Cards', pt: 'Cartas Solicitadas', ja: '希望カード' },
  prof_accept_btn: { en: 'Accept Trade', pt: 'Aceitar Troca', ja: 'トレードを承諾' },
  prof_reject_btn: { en: 'Reject', pt: 'Recusar', ja: '拒否' },
  prof_remove_btn: { en: 'Remove', pt: 'Remover', ja: '削除' },
  prof_modal_add_title: { en: 'Add Card to Inventory', pt: 'Adicionar Carta ao Inventário', ja: 'インベントリにカードを追加' },
  prof_modal_select: { en: 'Select Card', pt: 'Selecionar Carta', ja: 'カードを選択' },
  prof_modal_status: { en: 'Status', pt: 'Status', ja: 'ステータス' },
  prof_modal_price: { en: 'Price ($)', pt: 'Preço ($)', ja: '価格 ($)' },
  prof_modal_add_btn: { en: 'Add Card', pt: 'Adicionar Carta', ja: 'カードを追加' },

  // Login
  log_login_tab: { en: 'Login', pt: 'Entrar', ja: 'ログイン' },
  log_reg_tab: { en: 'Register', pt: 'Cadastrar', ja: '新規登録' },
  log_user_label: { en: 'Username', pt: 'Nome de Usuário', ja: 'ユーザー名' },
  log_email_label: { en: 'Email', pt: 'E-mail', ja: 'メールアドレス' },
  log_pass_label: { en: 'Password', pt: 'Senha', ja: 'パスワード' },
  log_btn_enter: { en: 'Enter DuelistHub', pt: 'Entrar no DuelistHub', ja: 'DuelistHubに入る' },
  log_btn_create: { en: 'Create Duelist Account', pt: 'Criar Conta de Duelista', ja: 'アカウントを作成' },
  log_summoning: { en: 'Summoning...', pt: 'Invocando...', ja: '召喚中...' },

  // Card Detail
  cd_desc_title: { en: 'Description / Effect', pt: 'Descrição / Efeito', ja: '説明 / 効果' },
  cd_loading: { en: 'Loading card data...', pt: 'Carregando dados da carta...', ja: 'カードデータを読み込み中...' },
  cd_not_found: { en: 'Card not found.', pt: 'Carta não encontrada.', ja: 'カードが見つかりません。' },
  cd_trade_proposal: { en: 'Trade Proposal', pt: 'Proposta de troca', ja: 'トレード提案' },
  cd_sale_proposal: { en: 'Buy Proposal', pt: 'Proposta de venda', ja: '購入提案' },
  cd_modal_title: { en: 'Trade Proposal for', pt: 'Proposta de Troca por', ja: 'トレード提案:' },
  cd_modal_select_duelist: { en: 'Select Duelist Offering This Card:', pt: 'Selecione o Duelista Oferecendo esta Carta:', ja: 'このカードを出品しているデュエリストを選択:' },
  cd_modal_select_inventory: { en: 'Select Cards from your Inventory to Offer:', pt: 'Selecione Cartas do seu Inventário para Oferecer:', ja: '提供するインベントリのカードを選択:' },
  cd_modal_send_btn: { en: 'Send Trade Offer', pt: 'Enviar Proposta de Troca', ja: 'トレード提案を送信' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_language') as Language;
      if (stored && ['en', 'pt', 'ja'].includes(stored)) {
        setLanguageState(stored);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yugioh_language', lang);
    }
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      return key; // fallback to key
    }
    return translations[key][language] || translations[key].en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
