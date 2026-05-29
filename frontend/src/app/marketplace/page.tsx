'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TiltCardWrapper from '@/components/TiltCardWrapper';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Marketplace.module.css';

interface UserCard {
  id: number;
  user: { id: number; username: string };
  card: { id: number; name: string; namePt?: string; nameJa?: string; type: string; imageUrl: string; imageUrlPt?: string; imageUrlJa?: string };
  status: string;
  price: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { t, language, formatPrice } = useLanguage();
  const [marketCards, setMarketCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Trade Modal
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [targetCard, setTargetCard] = useState<UserCard | null>(null);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedMyCardIds, setSelectedMyCardIds] = useState<number[]>([]);
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [tradeError, setTradeError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
    fetchMarketCards();
  }, []);

  const fetchMarketCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards/market`);
      const data = await res.json();
      setMarketCards(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching market cards:', err);
      setMarketCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (uc: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'カードを購入するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para comprar cartas! Deseja ir para a tela de login?' : 'Please login to buy cards! Go to login page?');
      if (confirmLogin) {
        router.push('/login');
      }
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
        fetchMarketCards();
      }
    } catch (err) {
      console.error('Error buying card:', err);
    }
  };

  const handleOpenTradeModal = async (uc: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'トレードを提案するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para oferecer trocas! Deseja ir para a tela de login?' : 'Please login to offer trades! Go to login page?');
      if (confirmLogin) {
        router.push('/login');
      }
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
    setShowTradeModal(true);
    setModalLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/users/${currentUser.id}/cards`);
      const data = await res.json();
      // Filter out cards that are already in pending trades or just show available
      setMyCards(Array.isArray(data) ? data.filter((c: UserCard) => c.status !== 'COLLECTION') : []);
    } catch (err) {
      console.error('Error fetching my cards for trade:', err);
      setMyCards([]);
    } finally {
      setModalLoading(false);
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
      setTradeError('Please select at least one card to offer.');
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
        setTradeSuccess('Trade proposal sent successfully! The duelist will review your offer.');
        setTimeout(() => {
          setShowTradeModal(false);
        }, 2000);
      } else {
        setTradeError('Failed to send trade proposal.');
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
      setTradeError('An error occurred.');
    }
  };

  const getCardName = (card: any) => {
    if (language === 'pt') return card.namePt || card.name;
    if (language === 'ja') return card.nameJa || card.name;
    return card.name;
  };

  const getCardImage = (card: any) => {
    if (!card) return '';
    if (language === 'pt') return card.imageUrlPt || card.imageUrl;
    if (language === 'ja') return card.imageUrlJa || card.imageUrl;
    return card.imageUrl;
  };

  const filteredCards = marketCards.filter(uc => {
    const matchesSearch = getCardName(uc.card).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || uc.status === filterStatus;
    const notMine = !currentUser || uc.user.id !== currentUser.id;
    return matchesSearch && matchesStatus && notMine;
  });

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('market_title')}</h1>
          <div className={styles.controls}>
            <input 
              type="text" 
              placeholder={t('search_market')} 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">{t('all_listings')}</option>
              <option value="FOR_SALE">{t('for_sale')}</option>
              <option value="FOR_TRADE">{t('for_trade')}</option>
            </select>
          </div>
        </div>
        <p className={styles.subtitle}>{t('market_subtitle')}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>{t('summoning_market')}</div>
      ) : (
        <div className={styles.grid}>
          {filteredCards.map(uc => (
            <TiltCardWrapper 
              key={uc.id} 
              className={`${styles.card} glass-panel`}
              onClick={() => router.push(`/cards/${uc.card.id}`)}
            >
              <img 
                src={getCardImage(uc.card)} 
                alt={getCardName(uc.card)} 
                className={styles.image} 
                onError={(e) => { 
                  if (e.currentTarget.src !== uc.card.imageUrl) {
                    e.currentTarget.src = uc.card.imageUrl; 
                  }
                }} 
              />
              <h3 className={styles.cardName}>{getCardName(uc.card)}</h3>
              <div className={styles.owner}>{t('listed_by')} <strong>{uc.user?.username}</strong></div>
              
              <span className={`${styles.statusBadge} ${uc.status === 'FOR_SALE' ? styles.statusSale : styles.statusTrade}`}>
                {uc.status === 'FOR_SALE' ? t('for_sale') : t('for_trade')}
              </span>

              {uc.status === 'FOR_SALE' && <div className={styles.price}>{formatPrice(uc.price)}</div>}

              {uc.status === 'FOR_SALE' ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(uc);
                  }} 
                  className={`btn-primary ${styles.actionBtn}`}
                  style={{ position: 'relative', zIndex: 20 }}
                >
                  {t('buy_now')}
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenTradeModal(uc);
                  }} 
                  className={`btn-primary ${styles.actionBtn}`}
                  style={{ position: 'relative', zIndex: 20 }}
                >
                  {t('offer_trade')}
                </button>
              )}
            </TiltCardWrapper>
          ))}
          {filteredCards.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>{t('no_market_match')}</p>
          )}
        </div>
      )}

      {showTradeModal && targetCard && (
        <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
          <div className="glass-panel" style={{ width:'100%', maxWidth:'600px', padding:'2.5rem', display:'flex', flexDirection:'column', gap:'1.5rem', maxHeight:'90vh', overflowY:'auto' }}>
            <h2>Offer Trade to {targetCard.user.username}</h2>
            <p>You are requesting: <strong>{getCardName(targetCard.card)}</strong></p>

            {tradeSuccess && <div style={{ color: '#4aff80', background: 'rgba(74, 255, 128, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(74, 255, 128, 0.3)' }}>{tradeSuccess}</div>}
            {tradeError && <div style={{ color: '#ff4a4a', background: 'rgba(255, 74, 74, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 74, 74, 0.3)' }}>{tradeError}</div>}

            {modalLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ja' ? 'インベントリを読み込み中...' : language === 'pt' ? 'Carregando seu inventário...' : 'Loading your inventory...'}
                </p>
                <button type="button" onClick={() => setShowTradeModal(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Select Cards from your Inventory to Offer:</h3>
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
                    {myCards.length === 0 && <p>You do not have any cards available for trade or sale in your inventory. Add cards in your Profile first!</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowTradeModal(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={handleOfferTradeSubmit} disabled={selectedMyCardIds.length === 0} className="btn-primary">Send Trade Offer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
