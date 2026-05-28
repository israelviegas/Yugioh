'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TiltCardWrapper from '@/components/TiltCardWrapper';
import ChatModal from '@/components/ChatModal';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Cards.module.css';

interface Card {
  id: number;
  name: string;
  namePt?: string;
  nameJa?: string;
  description?: string;
  descriptionPt?: string;
  descriptionJa?: string;
  type: string;
  attack: number;
  defense: number;
  level: number;
  attribute: string;
  imageUrl: string;
  imageUrlPt?: string;
  imageUrlJa?: string;
}

interface UserCard {
  id: number;
  user: { id: number; username: string };
  card: Card;
  status: string;
  price: number;
  condition?: {
    code: string;
    nameEn: string;
    namePt: string;
    nameJa: string;
  };
}

export default function CardsPage() {
  const router = useRouter();
  const { t, language, formatPrice } = useLanguage();
  
  // Base Catalog States
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [preFilterSearchTerm, setPreFilterSearchTerm] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  
  // Market & Filter States
  const [filterStatus, setFilterStatus] = useState('ALL_CARDS');
  const [marketCards, setMarketCards] = useState<UserCard[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Trade Modal States
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Chat Modal States
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<{ id: number; username: string } | null>(null);
  const [chatCard, setChatCard] = useState<Card | null>(null);
  const [targetCard, setTargetCard] = useState<UserCard | null>(null);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedMyCardIds, setSelectedMyCardIds] = useState<number[]>([]);
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [tradeError, setTradeError] = useState('');

  // Initial user setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  // Reset catalog state on custom event
  useEffect(() => {
    const handleReset = () => {
      setCurrentPage(1);
      setFilterStatus('ALL_CARDS');
      setSearchTerm('');
      setDebouncedSearch('');
      setPreFilterSearchTerm(null);
    };

    window.addEventListener('reset_catalog', handleReset);
    return () => {
      window.removeEventListener('reset_catalog', handleReset);
    };
  }, []);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPage = sessionStorage.getItem('catalog_page');
      if (savedPage) setCurrentPage(Number(savedPage));
      
      const savedFilter = sessionStorage.getItem('catalog_filter');
      if (savedFilter) setFilterStatus(savedFilter);

      const savedSearch = sessionStorage.getItem('catalog_search');
      if (savedSearch) {
        setSearchTerm(savedSearch);
        setDebouncedSearch(savedSearch);
      }
      
      const savedItems = sessionStorage.getItem('catalog_items');
      if (savedItems) setItemsPerPage(Number(savedItems));
    }
    setIsInitialized(true);
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    if (!isInitialized) return;
    sessionStorage.setItem('catalog_page', currentPage.toString());
    sessionStorage.setItem('catalog_filter', filterStatus);
    sessionStorage.setItem('catalog_search', searchTerm);
    sessionStorage.setItem('catalog_items', itemsPerPage.toString());
  }, [currentPage, filterStatus, searchTerm, itemsPerPage, isInitialized]);

  // Debounce search
  useEffect(() => {
    if (!isInitialized) return;
    const handler = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setCurrentPage(1); // reset to page 1 on new search
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm, isInitialized, debouncedSearch]);

  // Data Fetching logic
  useEffect(() => {
    if (!isInitialized) return;
    setLoading(true);
    
    if (filterStatus === 'ALL_CARDS') {
      const pageParam = currentPage - 1;
      const url = `${getApiUrl()}/api/cards?page=${pageParam}&size=${itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}`;
      
      Promise.all([
        fetch(url).then(res => res.json()),
        fetch(`${getApiUrl()}/api/user-cards/market`).then(res => res.json())
      ]).then(([cardsData, marketData]) => {
        if (cardsData && typeof cardsData === 'object' && 'content' in cardsData) {
          setCards(Array.isArray(cardsData.content) ? cardsData.content : []);
          setTotalPages(cardsData.totalPages || 1);
        } else {
          setCards(Array.isArray(cardsData) ? cardsData : []);
          setTotalPages(1);
        }
        setMarketCards(Array.isArray(marketData) ? marketData : []);
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching data:', err);
        setCards([]);
        setMarketCards([]);
        setTotalPages(1);
        setLoading(false);
      });
    } else {
      // Fetch market cards only
      fetch(`${getApiUrl()}/api/user-cards/market`)
        .then(res => res.json())
        .then(data => {
          setMarketCards(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching market cards:', err);
          setMarketCards([]);
          setLoading(false);
        });
    }
  }, [currentPage, itemsPerPage, debouncedSearch, filterStatus, isInitialized]);

  const getCardName = (card: Card) => {
    if (language === 'pt') return card.namePt || card.name;
    if (language === 'ja') return card.nameJa || card.name;
    return card.name;
  };

  const getCardImage = (card: Card) => {
    if (language === 'pt') return card.imageUrlPt || card.imageUrl;
    if (language === 'ja') return card.imageUrlJa || card.imageUrl;
    return card.imageUrl;
  };

  // Processing Market Cards
  let processedMarketCards: UserCard[] = [];
  if (filterStatus !== 'ALL_CARDS') {
    processedMarketCards = marketCards.filter(uc => {
      // Status filtering
      let matchesStatus = true;
      if (filterStatus === 'FOR_SALE') matchesStatus = uc.status === 'FOR_SALE';
      if (filterStatus === 'FOR_TRADE') matchesStatus = uc.status === 'FOR_TRADE';
      
      // User filtering
      let matchesUser = true;
      if (filterStatus === 'MY_LISTINGS') {
        matchesUser = currentUser && uc.user.id === currentUser.id;
      }
      
      // Search term
      const matchesSearch = getCardName(uc.card).toLowerCase().includes(debouncedSearch.toLowerCase());
      
      return matchesStatus && matchesUser && matchesSearch;
    }).sort((a, b) => a.price - b.price);
  }

  useEffect(() => {
    if (filterStatus !== 'ALL_CARDS') {
      setTotalPages(Math.max(1, Math.ceil(processedMarketCards.length / itemsPerPage)));
    }
  }, [processedMarketCards.length, itemsPerPage, filterStatus]);

  // The final cards array to render for current page
  let itemsToRender: any[] = [];
  if (filterStatus === 'ALL_CARDS') {
    if (cards.length === 1) {
      itemsToRender = cards.flatMap(c => {
        const sortedMarketCards = marketCards
          .filter(uc => uc.card.id === c.id && uc.status !== 'COLLECTION')
          .sort((a, b) => {
            if (a.status === 'FOR_TRADE' && b.status === 'FOR_SALE') return -1;
            if (a.status === 'FOR_SALE' && b.status === 'FOR_TRADE') return 1;
            return a.price - b.price;
          });
        return [c, ...sortedMarketCards];
      });
    } else {
      itemsToRender = cards;
    }
  } else {
    itemsToRender = processedMarketCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }

  // Market Handlers
  const handleBuyNow = async (uc: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'カードを購入するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para comprar cartas! Deseja ir para a tela de login?' : 'Please login to buy cards! Go to login page?');
      if (confirmLogin) router.push('/login');
      return;
    }

    if (uc.user.id === currentUser.id) {
      alert(language === 'ja' ? '自分のカードは購入できません！' : language === 'pt' ? 'Você não pode comprar sua própria carta!' : 'You cannot buy your own card!');
      return;
    }

    const confirmMsg = language === 'ja'
      ? `このカードを ${uc.user.username} から ${formatPrice(uc.price)} で購入しますか？`
      : language === 'pt'
      ? `Deseja comprar esta carta de ${uc.user.username} por ${formatPrice(uc.price)}?`
      : `Do you want to buy this card from ${uc.user.username} for ${formatPrice(uc.price)}?`;
      
    const confirmBuy = window.confirm(confirmMsg);
    if (!confirmBuy) return;

    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards/${uc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COLLECTION' })
      });
      if (res.ok) {
        alert(
          language === 'ja'
            ? `${getCardName(uc.card)} を ${formatPrice(uc.price)} で購入しました！コレクションに追加されました。`
            : language === 'pt'
            ? `Comprado com sucesso "${getCardName(uc.card)}" por ${formatPrice(uc.price)}! Adicionado à sua coleção.`
            : `Successfully purchased "${getCardName(uc.card)}" for ${formatPrice(uc.price)}! Added to your collection.`
        );
        // Refresh
        setLoading(true);
        fetch(`${getApiUrl()}/api/user-cards/market`)
          .then(r => r.json())
          .then(d => { setMarketCards(Array.isArray(d) ? d : []); setLoading(false); })
          .catch(() => setLoading(false));
      }
    } catch (err) {
      console.error('Error buying card:', err);
    }
  };

  const handleOpenChat = (user: { id: number; username: string }, card: Card) => {
    if (!currentUser) {
      if (window.confirm(t('chat_login_req'))) {
        router.push('/login');
      }
      return;
    }
    if (user.id === currentUser.id) return;
    setChatTargetUser(user);
    setChatCard(card);
    setShowChatModal(true);
  };

  const handleOpenTradeModal = async (uc: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'トレードを提案するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para oferecer trocas! Deseja ir para a tela de login?' : 'Please login to offer trades! Go to login page?');
      if (confirmLogin) router.push('/login');
      return;
    }

    if (uc.user.id === currentUser.id) {
      alert(language === 'ja' ? '自分とトレードすることはできません！' : language === 'pt' ? 'Você não pode trocar com você mesmo!' : 'You cannot trade with yourself!');
      return;
    }

    setTargetCard(uc);
    setSelectedMyCardIds([]);
    setTradeSuccess('');
    setTradeError('');

    try {
      const res = await fetch(`${getApiUrl()}/api/users/${currentUser.id}/cards`);
      const data = await res.json();
      setMyCards(Array.isArray(data) ? data.filter((c: UserCard) => c.status !== 'COLLECTION') : []);
      setShowTradeModal(true);
    } catch (err) {
      console.error('Error fetching my cards for trade:', err);
      setMyCards([]);
    }
  };

  const handleToggleSelectMyCard = (id: number) => {
    if (selectedMyCardIds.includes(id)) {
      setSelectedMyCardIds(selectedMyCardIds.filter(item => item !== id));
    } else {
      setSelectedMyCardIds([...selectedMyCardIds, id]);
    }
  };

  const handleOfferTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCard || !currentUser || selectedMyCardIds.length === 0) {
      setTradeError(t('cd_modal_trade_select_err'));
      return;
    }

    setTradeError('');
    try {
      const res = await fetch(`${getApiUrl()}/api/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: targetCard.user.id,
          offeredCardIds: selectedMyCardIds,
          requestedCardIds: [targetCard.id]
        })
      });

      if (res.ok) {
        setTradeSuccess(t('cd_modal_trade_success'));
        setTimeout(() => setShowTradeModal(false), 2000);
      } else {
        setTradeError(t('cd_modal_trade_fail'));
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
      setTradeError(language === 'ja' ? 'エラーが発生しました。' : language === 'pt' ? 'Ocorreu um erro.' : 'An error occurred.');
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          type="button"
          onClick={() => setCurrentPage(1)}
          className={`${styles.pageBtn} ${currentPage === 1 ? styles.activePage : ''}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className={styles.dots}>...</span>);
      }
    }
    
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          type="button"
          onClick={() => setCurrentPage(page)}
          className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
        >
          {page}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" className={styles.dots}>...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          type="button"
          onClick={() => setCurrentPage(totalPages)}
          className={`${styles.pageBtn} ${currentPage === totalPages ? styles.activePage : ''}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>{t('cards_title')}</h1>
        <p className={styles.subtitle}>{t('cards_subtitle')}</p>
        <div className={styles.headerRow}>
          <div className={styles.controls}>
            <input 
              type="text" 
              placeholder={t('search_placeholder')} 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPreFilterSearchTerm(null);
              }}
            />
            
            <select 
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL_CARDS">{t('filter_all_cards')}</option>
              <option value="ALL_MARKET">{t('filter_all_market')}</option>
              <option value="FOR_SALE">{t('filter_for_sale')}</option>
              <option value="FOR_TRADE">{t('filter_for_trade')}</option>
              {currentUser && <option value="MY_LISTINGS">{t('filter_my_listings')}</option>}
            </select>

            <div className={styles.itemsPerPageContainer}>
              <span>{t('cards_per_page')}</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={styles.itemsPerPageSelect}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={80}>80</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>{t('summoning_cards')}</div>
      ) : (
        <>
          {filterStatus === 'ALL_CARDS' && cards.length === 1 && searchTerm && (
            <button 
              className={styles.backButton} 
              onClick={() => {
                if (preFilterSearchTerm !== null) {
                  setSearchTerm(preFilterSearchTerm);
                  setPreFilterSearchTerm(null);
                } else {
                  setSearchTerm('');
                }
              }}
            >
              ← {language === 'ja' ? '戻る' : language === 'pt' ? 'Voltar' : 'Back'}
            </button>
          )}
          <div className={styles.grid}>
            {itemsToRender.map((item: any) => {
              const isMarketCard = !!item.user;
              const cardData = isMarketCard ? item.card : item;
              const isOwner = isMarketCard && currentUser && item.user.id === currentUser.id;

              return (
                <TiltCardWrapper 
                  key={isMarketCard ? `uc-${item.id}` : `c-${cardData.id}`} 
                  className={`${styles.card} glass-panel`}
                  onClick={() => {
                    if (isMarketCard) {
                      router.push(`/cards/${cardData.id}?listing=${item.id}`);
                    } else {
                      const hasOptions = marketCards.some(uc => uc.card.id === cardData.id && uc.status !== 'COLLECTION');
                      if (hasOptions && cards.length > 1) {
                        setPreFilterSearchTerm(searchTerm);
                        setSearchTerm(getCardName(cardData));
                      } else {
                        router.push(`/cards/${cardData.id}`);
                      }
                    }
                  }}
                >
                  <div className={styles.imageContainer}>
                    {cardData.imageUrl ? (
                      <img 
                        src={getCardImage(cardData)} 
                        alt={getCardName(cardData)} 
                        className={styles.image} 
                        onError={(e) => { 
                          if (e.currentTarget.src !== cardData.imageUrl) {
                            e.currentTarget.src = cardData.imageUrl; 
                          }
                        }} 
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>{t('no_image')}</div>
                    )}
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>{getCardName(cardData)}</h3>
                    
                    {isMarketCard ? (
                      <>
                        <div className={styles.owner} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                          {t('listed_by')} <span style={{ color: 'var(--text-primary)' }}>{item.user?.username}</span>
                        </div>
                        {item.condition && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                            {language === 'ja' ? '状態: ' : language === 'pt' ? 'Condição: ' : 'Condition: '} 
                            <span style={{ color: 'var(--text-primary)' }}>{language === 'ja' ? item.condition.nameJa : language === 'pt' ? item.condition.namePt : item.condition.nameEn} ({item.condition.code})</span>
                          </div>
                        )}
                        {item.rarity && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            {language === 'ja' ? 'レアリティ: ' : language === 'pt' ? 'Raridade: ' : 'Rarity: '} 
                            <span style={{ color: 'var(--text-primary)' }}>{item.rarity}</span>
                          </div>
                        )}
                        <span className={`${styles.statusBadge} ${item.status === 'FOR_SALE' ? styles.statusSale : styles.statusTrade}`}>
                          {item.status === 'FOR_SALE' ? t('for_sale') : t('for_trade')}
                        </span>
                        
                        {item.status === 'FOR_SALE' && <div className={styles.price}>{formatPrice(item.price)}</div>}
                        
                        {isOwner ? (
                          // Botão exibido se o anúncio for do próprio usuário logado (redireciona para o detalhe daquela proposta)
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/cards/${cardData.id}?listing=${item.id}`);
                            }}
                            className={`btn-secondary ${styles.actionBtn}`}
                            style={{ width: '100%', position: 'relative', zIndex: 20 }}
                          >
                            {t('my_proposal')}
                          </button>
                        ) : (
                          <>
                            {item.status === 'FOR_SALE' ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyNow(item);
                                }} 
                                className={`btn-primary ${styles.actionBtn}`}
                              >
                                {t('buy_now')}
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTradeModal(item);
                                }} 
                                className={`btn-primary ${styles.actionBtn}`}
                              >
                                {t('offer_trade')}
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChat(item.user, cardData);
                              }}
                              className={`btn-secondary ${styles.actionBtn}`}
                              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', position: 'relative', zIndex: 20 }}
                            >
                              💬 {t('chat_with')} {item.user.username}
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className={styles.cardType}>{cardData.type}</p>
                        <div className={styles.stats}>
                          {cardData.attack !== null && <span>ATK: {cardData.attack}</span>}
                          {cardData.defense !== null && <span>DEF: {cardData.defense}</span>}
                        </div>
                        {cards.length > 1 && marketCards.some(uc => uc.card.id === cardData.id && uc.status !== 'COLLECTION') && (
                          <button 
                            className={`btn-secondary ${styles.optionsBtn}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm(getCardName(cardData));
                            }}
                          >
                            {t('options_available')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </TiltCardWrapper>
              );
            })}
            {itemsToRender.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                {filterStatus !== 'ALL_CARDS' ? t('no_market_match') : 'No cards found.'}
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                type="button" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                {t('prev')}
              </button>

              {renderPaginationButtons()}

              <button 
                type="button" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}

      {showTradeModal && targetCard && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
          <div className="glass-panel" style={{ width:'100%', maxWidth:'600px', padding:'2.5rem', display:'flex', flexDirection:'column', gap:'1.5rem', maxHeight:'90vh', overflowY:'auto' }}>
            <h2>{t('cd_modal_title')} {targetCard.user.username}</h2>
            <p>{language === 'ja' ? '希望カード:' : language === 'pt' ? 'Você está solicitando:' : 'You are requesting:'} <strong>{getCardName(targetCard.card)}</strong></p>

            {tradeSuccess && <div style={{ color: '#4aff80', background: 'rgba(74, 255, 128, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(74, 255, 128, 0.3)' }}>{tradeSuccess}</div>}
            {tradeError && <div style={{ color: '#ff4a4a', background: 'rgba(255, 74, 74, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 74, 74, 0.3)' }}>{tradeError}</div>}

            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{t('cd_modal_select_inventory')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                {myCards.map(myCard => {
                  const isSelected = selectedMyCardIds.includes(myCard.id);
                  return (
                    <div 
                      key={myCard.id} 
                      onClick={() => handleToggleSelectMyCard(myCard.id)}
                      style={{ 
                        border: isSelected ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)', 
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.3)',
                        padding: '0.8rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <img 
                        src={getCardImage(myCard.card)} 
                        alt="" 
                        style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => { 
                          if (e.currentTarget.src !== myCard.card.imageUrl) {
                            e.currentTarget.src = myCard.card.imageUrl; 
                          }
                        }} 
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 'bold' : 'normal' }}>{getCardName(myCard.card)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({myCard.status})</span>
                    </div>
                  );
                })}
                {myCards.length === 0 && <p>{t('cd_modal_no_inventory')}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowTradeModal(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>{t('cancel')}</button>
              <button type="button" onClick={handleOfferTradeSubmit} disabled={selectedMyCardIds.length === 0} className="btn-primary">{t('cd_modal_send_btn')}</button>
            </div>
          </div>
        </div>
      )}

      {showChatModal && chatTargetUser && currentUser && chatCard && (
        <ChatModal 
          currentUser={currentUser} 
          targetUser={chatTargetUser} 
          onClose={() => setShowChatModal(false)} 
          initialMessage={(() => {
            const cardName = getCardName(chatCard);
            let baseName = cardName;
            let suffix = '';
            if (cardName.endsWith(' (PT-BR)')) {
              baseName = cardName.replace(' (PT-BR)', '');
              suffix = ' (PT-BR)';
            } else if (cardName.endsWith(' (JP)')) {
              baseName = cardName.replace(' (JP)', '');
              suffix = ' (JP)';
            }
            
            let quotedBase = baseName;
            if (!baseName.startsWith('"') || !baseName.endsWith('"')) {
              quotedBase = `"${baseName.replace(/"/g, '')}"`;
            }
            
            if (language === 'pt') {
              return `Olá, tenho interesse na sua carta ${quotedBase}${suffix}!`;
            } else if (language === 'ja') {
              return `こんにちは、あなたのカードに興味があります ${quotedBase}${suffix}!`;
            } else {
              return `Hi, I have interest in your card ${quotedBase}${suffix}!`;
            }
          })()}
        />
      )}
    </div>
  );
}
