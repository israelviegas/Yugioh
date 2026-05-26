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
  nav_cards: { en: 'Catalog', pt: 'Catálogo', ja: 'カタログ' },
  nav_market: { en: 'Market', pt: 'Mercado', ja: 'マーケット' },
  nav_strategies: { en: 'Strategies', pt: 'Estratégias', ja: '戦略' },
  nav_inventory: { en: 'My Inventory', pt: 'Meu Inventário', ja: 'マイインベントリ' },
  nav_login: { en: 'Login', pt: 'Entrar', ja: 'ログイン' },
  nav_logout: { en: 'Logout', pt: 'Sair', ja: 'ログアウト' },
  nav_messages: { en: 'Messages', pt: 'Mensagens', ja: 'メッセージ' },

  // Home
  home_hero_title: { en: 'THE ULTIMATE YU-GI-OH! TRADING HUB', pt: 'O MAIOR HUB DE TROCAS DE YU-GI-OH!', ja: '究極の遊戯王トレーディングハブ' },
  home_hero_subtitle: { en: 'Buy, sell, and trade legendary cards with duelists worldwide. Share winning strategies and become the King of Games.', pt: 'Compre, venda e troque cartas lendárias com duelistas de todo o mundo. Compartilhe estratégias e torne-se o Rei dos Jogos.', ja: '世界中のデュエリストと伝説のカードを売買・トレード。勝利の戦略を共有し、キング・オブ・ゲームズになろう。' },
  home_cta_explore: { en: 'Explore Catalog', pt: 'Explorar Catálogo', ja: 'カタログを探す' },
  home_cta_market: { en: 'Enter Marketplace', pt: 'Entrar no Mercado', ja: 'マーケットに入る' },
  home_feat1_title: { en: 'Card Catalog', pt: 'Catálogo de Cartas', ja: 'カードカタログ' },
  home_feat1_desc: { en: 'Explore over 10,000+ Yu-Gi-Oh! cards with complete stats, rulings, and high-resolution artworks.', pt: 'Explore mais de 10.000 cartas de Yu-Gi-Oh! com estatísticas completas, regras e artes em alta resolução.', ja: '10,000枚以上の遊戯王カードの詳細ステータス、裁定、高解像度アートワークを閲覧できます。' },
  home_feat2_title: { en: 'Marketplace', pt: 'Mercado de Duelistas', ja: 'マーケットプレイス' },
  home_feat2_desc: { en: 'List your rare cards for sale or set up secure trade proposals with other verified collectors.', pt: 'Anuncie suas cartas raras para venda ou crie propostas de troca seguras com outros colecionadores.', ja: 'レアカードを出品したり、他のコレクターと安全なトレード提案を行うことができます。' },
  home_feat3_title: { en: 'Strategy Guides', pt: 'Guias de Estratégia', ja: '戦略ガイド' },
  home_feat3_desc: { en: 'Master the meta. Read and share advanced deck breakdowns, combo guides, and tournament reports.', pt: 'Domine o meta. Leia e compartilhe análises de decks, guias de combos e relatórios de torneios.', ja: 'メタを制覇しよう。上級者のデッキ解説、コンボガイド、大会レポートを読んだり共有したりできます。' },

  // Cards
  cards_title: { en: 'Card Catalog', pt: 'Catálogo de Cartas', ja: 'カードカタログ' },
  cards_subtitle: { 
    en: 'Here you find all cards from the YU-GI-OH universe! You can also filter cards that have buy and trade offers listed by our players.', 
    pt: 'Aqui você encontra todas as cartas do universo de YU-GI-OH!\nE você consegue filtrar as cartas que possuem ofertas de compra e troca anunciadas pelos nossos jogadores.', 
    ja: '遊戯王のすべてのカードがここに見つかります！さらに、プレイヤーが掲示した購入やトレードのオファーがあるカードをフィルタリングすることもできます。' 
  },
  search_placeholder: { en: 'Search by name...', pt: 'Buscar por nome...', ja: '名前で検索...' },
  cards_per_page: { en: 'Cards per page:', pt: 'Cartas por página:', ja: '表示件数:' },
  summoning_cards: { en: 'Summoning cards...', pt: 'Invocando cartas...', ja: 'カードを召喚中...' },
  no_image: { en: 'No Image', pt: 'Sem Imagem', ja: '画像なし' },
  prev: { en: 'Prev', pt: 'Anterior', ja: '前へ' },
  next: { en: 'Next', pt: 'Próxima', ja: '次へ' },
  all: { en: 'All', pt: 'Todas', ja: 'すべて' },
  filter_all_cards: { en: 'All', pt: 'Todas', ja: 'すべて' },
  filter_all_market: { en: 'For Sale or For Trade', pt: 'À Venda ou Para Troca', ja: '販売またはトレード' },
  filter_for_sale: { en: 'For Sale', pt: 'À Venda', ja: '販売中' },
  filter_for_trade: { en: 'For Trade', pt: 'Para Troca', ja: 'トレード用' },
  filter_my_listings: { en: 'Listed by me', pt: 'Anunciadas por mim', ja: '私の出品' },

  // Marketplace
  market_title: { en: 'Marketplace Hub', pt: 'Centro de Mercado', ja: 'マーケットプレイスハブ' },
  market_subtitle: {
    en: 'Here you find cards for sale or trade listed by our players',
    pt: 'Aqui você encontra as cartas para venda ou troca colocadas pelos nossos jogadores',
    ja: 'ここでは、プレイヤーが出品した販売・交換用のカードを見つけることができます',
  },
  search_market: { en: 'Search market...', pt: 'Buscar no mercado...', ja: '市場を検索...' },
  all_listings: { en: 'All Listings', pt: 'Todos os Anúncios', ja: 'すべての出品' },
  for_sale: { en: 'For Sale', pt: 'À Venda', ja: '販売中' },
  for_trade: { en: 'For Trade', pt: 'Para Troca', ja: 'トレード用' },
  listed_by: { en: 'Listed by:', pt: 'Anunciado por:', ja: '出品者:' },
  buy_now: { en: 'Buy Now', pt: 'Comprar Agora', ja: '今すぐ購入' },
  offer_trade: { en: 'Offer Trade', pt: 'Trocar Agora', ja: 'トレードを提案' },
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
  prof_inventory_title: { en: 'Inventory', pt: 'Inventário', ja: 'インベントリ' },
  prof_no_cards_found: { en: 'No cards found in this section.', pt: 'Nenhuma carta encontrada nesta seção.', ja: 'このセクションにカードが見つかりません。' },
  prof_modal_add_title: { en: 'Add Card to Inventory', pt: 'Adicionar Carta ao Inventário', ja: 'インベントリにカードを追加' },
  prof_modal_select: { en: 'Select Card', pt: 'Selecionar Carta', ja: 'カードを選択' },
  prof_modal_status: { en: 'Status', pt: 'Status', ja: 'ステータス' },
  prof_modal_price: { en: 'Price ($)', pt: 'Preço (R$)', ja: '価格 (¥)' },
  prof_modal_add_btn: { en: 'Add Card', pt: 'Adicionar Carta', ja: 'カードを追加' },
  prof_sync_api: { en: 'Sync API', pt: 'Sincronizar API', ja: 'APIを同期' },
  prof_edit_profile: { en: 'Edit Profile', pt: 'Editar Perfil', ja: 'プロフィール編集' },
  prof_edit_modal_title: { en: 'Edit Profile', pt: 'Editar Perfil', ja: 'プロフィール編集' },
  prof_edit_username: { en: 'Username', pt: 'Nome de Usuário', ja: 'ユーザー名' },
  prof_edit_email: { en: 'Email', pt: 'E-mail', ja: 'メールアドレス' },
  prof_edit_password: { en: 'New Password (optional)', pt: 'Nova Senha (opcional)', ja: '新しいパスワード (任意)' },
  prof_edit_password_ph: { en: 'Leave blank to keep the same', pt: 'Deixe em branco para manter a mesma', ja: '変更しない場合は空白' },
  prof_edit_save: { en: 'Save', pt: 'Salvar', ja: '保存' },
  prof_edit_success: { en: 'Profile updated successfully!', pt: 'Perfil atualizado com sucesso!', ja: 'プロフィールが正常に更新されました！' },
  prof_edit_error: { en: 'Error updating profile.', pt: 'Erro ao atualizar perfil.', ja: 'プロフィールの更新中にエラーが発生しました。' },
  prof_sync_confirm: { en: 'Do you want to start syncing cards with the API? This will run on the server in the background.', pt: 'Deseja iniciar a sincronização de cartas com a API? Isso rodará no servidor em segundo plano.', ja: 'APIとカードの同期を開始しますか？これはサーバーのバックグラウンドで実行されます。' },
  prof_sync_success: { en: 'Synchronization started successfully on the server!', pt: 'Sincronização iniciada com sucesso no servidor!', ja: 'サーバーで同期が正常に開始されました！' },
  prof_sync_error: { en: 'Error starting synchronization.', pt: 'Erro ao iniciar sincronização.', ja: '同期の開始中にエラーが発生しました。' },
  prof_sync_comm_error: { en: 'Communication error when starting synchronization.', pt: 'Erro de comunicação ao iniciar sincronização.', ja: '同期開始時の通信エラー。' },

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
  cd_trade_proposal: { en: 'Trade Proposal', pt: 'Trocar Agora', ja: 'トレード提案' },
  cd_sale_proposal: { en: 'Buy Now', pt: 'Comprar Agora', ja: '今すぐ購入' },
  cd_modal_title: { en: 'Trade Proposal for', pt: 'Proposta de Troca por', ja: 'トレード提案:' },
  cd_modal_select_duelist: { en: 'Select Duelist Offering This Card:', pt: 'Selecione o Duelista Oferecendo esta Carta:', ja: 'このカードを出品しているデュエリストを選択:' },
  cd_modal_select_inventory: { en: 'Select Cards from your Inventory to Offer:', pt: 'Selecione Cartas do seu Inventário para Oferecer:', ja: '提供するインベントリのカードを選択:' },
  cd_modal_send_btn: { en: 'Send Trade Offer', pt: 'Enviar Proposta de Troca', ja: 'トレード提案を送信' },
  cd_modal_searching: { en: 'Searching marketplace for duelists offering this card...', pt: 'Buscando no mercado duelistas oferecendo esta carta...', ja: 'このカードを出品しているデュエリストを検索中...' },
  cd_modal_no_duelists: { en: 'No duelists currently have this card listed for trade in the marketplace.', pt: 'Nenhum duelista possui esta carta para troca no mercado no momento.', ja: '現在、このカードをトレードに出しているデュエリストはいません。' },
  cd_modal_trade_success: { en: 'Trade proposal sent successfully! The duelist will review your offer.', pt: 'Proposta de troca enviada com sucesso! O duelista revisará sua oferta.', ja: 'トレード提案を送信しました！相手がオファーを確認します。' },
  cd_modal_trade_fail: { en: 'Failed to send trade proposal.', pt: 'Falha ao enviar proposta de troca.', ja: 'トレード提案の送信に失敗しました。' },
  cd_modal_trade_select_err: { en: 'Please select a target duelist listing and at least one card to offer.', pt: 'Por favor, selecione o anúncio de um duelista e pelo menos uma carta para oferecer.', ja: '対象のデュエリストの出品と、提供するカードを少なくとも1枚選択してください。' },
  cd_modal_no_inventory: { en: 'You do not have any cards available for trade or sale in your inventory. Add cards in your Profile first!', pt: 'Você não tem cartas disponíveis para troca ou venda em seu inventário. Adicione cartas no seu Perfil primeiro!', ja: 'インベントリにトレードや販売が可能なカードがありません。先にプロフィールでカードを追加してください！' },

  // Chat
  chat_with: { en: 'Chat with', pt: 'Conversar com', ja: 'チャット' },
  chat_type_msg: { en: 'Type a message...', pt: 'Digite uma mensagem...', ja: 'メッセージを入力...' },
  chat_send: { en: 'Send', pt: 'Enviar', ja: '送信' },
  chat_login_req: { en: 'Please login to chat with this duelist! Go to login page?', pt: 'Por favor, faça login para conversar com este duelista! Deseja ir para a tela de login?', ja: 'チャットするにはログインしてください！ログイン画面へ移動しますか？' },
  chat_auto_msg: { en: 'Hi, I have interest in your card', pt: 'Olá, tenho interesse na sua carta', ja: 'こんにちは、あなたのカードに興味があります' },
  inbox_title: { en: 'My Messages', pt: 'Minhas Mensagens', ja: 'マイメッセージ' },
  inbox_no_messages: { en: 'No conversations found.', pt: 'Nenhuma conversa encontrada.', ja: '会話が見つかりません。' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currencySymbol: string;
  formatPrice: (price: number) => string;
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

  const currencySymbol = language === 'pt' ? 'R$' : language === 'ja' ? '¥' : '$';

  const formatPrice = (price: number): string => {
    if (language === 'ja') {
      // Iene não usa casas decimais
      return `¥${Math.round(price).toLocaleString('ja-JP')}`;
    }
    if (language === 'pt') {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currencySymbol, formatPrice }}>
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
