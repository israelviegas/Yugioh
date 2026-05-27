'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import TiltCardWrapper from '@/components/TiltCardWrapper';
import ChatModal from '@/components/ChatModal';
import cardStyles from '../Cards.module.css';
import styles from './CardDetail.module.css';

interface Card {
  id: number;
  name: string;
  namePt?: string;
  nameJa?: string;
  type: string;
  description: string;
  descriptionPt?: string;
  descriptionJa?: string;
  attack: number;
  defense: number;
  level: number;
  attribute: string;
  imageUrl: string;
  imageUrlPt?: string;
  imageUrlJa?: string;
  frameType?: string;
  race?: string;
  archetype?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  cardSets?: any[];
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
  rarity?: string;
}

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language, formatPrice } = useLanguage();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Trade Modal
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [availableListings, setAvailableListings] = useState<UserCard[]>([]);
  const [selectedListing, setSelectedListing] = useState<UserCard | null>(null);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedMyCardIds, setSelectedMyCardIds] = useState<number[]>([]);
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [tradeError, setTradeError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<{ id: number; username: string } | null>(null);

  // Marketplace & Add Card States
  const [marketListings, setMarketListings] = useState<UserCard[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatus, setAddStatus] = useState('COLLECTION');
  const [addCondition, setAddCondition] = useState('NM');
  const [addRarity, setAddRarity] = useState('Common');
  const [addPrice, setAddPrice] = useState<string>('0');
  const [addLoading, setAddLoading] = useState(false);
  const [conditions, setConditions] = useState<any[]>([]);

  const uniqueRarities = Array.from(new Set((card?.cardSets || []).map((cs: any) => cs.setRarity).filter(Boolean)));

  const fetchConditions = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/conditions`);
      if (res.ok) {
        const data = await res.json();
        setConditions(data);
      }
    } catch (err) {
      console.error('Error fetching conditions:', err);
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards/market`);
      const data = await res.json();
      setMarketListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }

    fetch(`${getApiUrl()}/api/cards/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Card not found');
        return res.json();
      })
      .then((data: Card) => {
        setCard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching card:', err);
        setLoading(false);
      });

    fetchMarketplaceListings();
    fetchConditions();
  }, [params.id]);

  const handleOpenAddInventoryModal = () => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'インベントリにカードを追加するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para adicionar cartas ao seu inventário! Deseja ir para a tela de login?' : 'Please login to add cards to your inventory! Go to login page?');
      if (confirmLogin) {
        router.push('/login');
      }
      return;
    }
    setAddStatus('COLLECTION');
    setAddCondition('NM');
    setAddRarity(uniqueRarities.length > 0 ? (uniqueRarities[0] as string) : 'Common');
    setAddPrice('0');
    setShowAddModal(true);
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !card) return;
    setAddLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cardId: card.id,
          status: addStatus,
          conditionCode: addCondition,
          rarity: addRarity,
          price: Number(addPrice)
        })
      });
      if (res.ok) {
        alert(language === 'ja' ? 'カードがインベントリに正常に追加されました！' : language === 'pt' ? 'Carta adicionada ao inventário com sucesso!' : 'Card successfully added to inventory!');
        setShowAddModal(false);
        fetchMarketplaceListings();
      } else {
        alert(language === 'ja' ? 'インベントリへのカードの追加に失敗しました。' : language === 'pt' ? 'Falha ao adicionar carta ao inventário.' : 'Failed to add card to inventory.');
      }
    } catch (err) {
      console.error('Error adding card to inventory:', err);
      alert(language === 'ja' ? 'エラーが発生しました。' : language === 'pt' ? 'Ocorreu um erro.' : 'An error occurred.');
    } finally {
      setAddLoading(false);
    }
  };
  const handleBuyCard = async (listing: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'カードを購入するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para comprar cartas! Deseja ir para a tela de login?' : 'Please login to buy cards! Go to login page?');
      if (confirmLogin) {
        router.push('/login');
      }
      return;
    }

    const confirmMsg = language === 'ja'
      ? `このカードを ${listing.user.username} から ${formatPrice(listing.price)} で購入しますか？`
      : language === 'pt'
      ? `Deseja comprar esta carta de ${listing.user.username} por ${formatPrice(listing.price)}?`
      : `Do you want to buy this card from ${listing.user.username} for ${formatPrice(listing.price)}?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COLLECTION' })
      });
      if (res.ok) {
        alert(
          language === 'ja'
            ? `${listing.user.username} から ${formatPrice(listing.price)} で購入しました！コレクションに追加されました。`
            : language === 'pt'
            ? `Comprado com sucesso de ${listing.user.username} por ${formatPrice(listing.price)}! Adicionado à sua coleção.`
            : `Successfully purchased from ${listing.user.username} for ${formatPrice(listing.price)}! Added to your collection.`
        );
        fetchMarketplaceListings();
      } else {
        alert('Failed to purchase card.');
      }
    } catch (err) {
      console.error('Error buying card:', err);
      alert('An error occurred.');
    }
  };

  const handleOpenChat = (user: { id: number; username: string }) => {
    if (!currentUser) {
      if (window.confirm(t('chat_login_req'))) {
        router.push('/login');
      }
      return;
    }
    if (user.id === currentUser.id) return;
    setChatTargetUser(user);
    setShowChatModal(true);
  };

  const handleOpenTradeModalTarget = async (listing: UserCard) => {
    if (!currentUser) {
      const confirmLogin = window.confirm(language === 'ja' ? 'トレードを提案するにはログインしてください！ログイン画面へ移動しますか？' : language === 'pt' ? 'Por favor, faça login para oferecer trocas! Deseja ir para a tela de login?' : 'Please login to offer trades! Go to login page?');
      if (confirmLogin) {
        router.push('/login');
      }
      return;
    }

    setShowTradeModal(true);
    setModalLoading(true);
    setTradeSuccess('');
    setTradeError('');
    setSelectedListing(listing);
    setSelectedMyCardIds([]);

    try {
      const myCardsRes = await fetch(`${getApiUrl()}/api/users/${currentUser.id}/cards`);
      const myCardsData = await myCardsRes.json();

      const listings = marketListings.filter((uc: UserCard) => 
        uc.card.id === card?.id && 
        uc.user.id !== currentUser.id &&
        uc.status === 'FOR_TRADE'
      );

      setAvailableListings(listings);
      setMyCards(myCardsData.filter((c: UserCard) => c.status !== 'COLLECTION'));
    } catch (err) {
      console.error('Error loading modal data:', err);
      setTradeError('Error loading trade data.');
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
    if (!selectedListing || !currentUser || selectedMyCardIds.length === 0) {
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
          receiverId: selectedListing.user.id,
          offeredCardIds: selectedMyCardIds,
          requestedCardIds: [selectedListing.id]
        })
      });

      if (res.ok) {
        setTradeSuccess(t('cd_modal_trade_success'));
        setTimeout(() => {
          setShowTradeModal(false);
        }, 2000);
      } else {
        setTradeError(t('cd_modal_trade_fail'));
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
      setTradeError('An error occurred.');
    }
  };

  const getCardName = (c: any) => {
    if (!c) return '';
    if (language === 'pt') return c.namePt || c.name;
    if (language === 'ja') return c.nameJa || c.name;
    return c.name;
  };

  const getCardDesc = (c: any) => {
    if (!c) return '';
    if (language === 'pt') return c.descriptionPt || c.description;
    if (language === 'ja') return c.descriptionJa || c.description;
    return c.description;
  };

  const getCardImage = (c: any) => {
    if (!c) return '';
    if (language === 'pt') return c.imageUrlPt || c.imageUrl;
    if (language === 'ja') return c.imageUrlJa || c.imageUrl;
    return c.imageUrl;
  };

  if (loading) return <div className={styles.loading}>{t('cd_loading')}</div>;
  if (!card) return <div className={styles.loading}>{t('cd_not_found')}</div>;

  const allOtherListings = marketListings
    .filter(l => l.card.id === card.id && (!currentUser || l.user.id !== currentUser.id))
    .sort((a, b) => a.price - b.price);
  
  const featuredListingId = searchParams.get('listing');
  let featuredListing = null;
  let otherListings = allOtherListings;

  if (featuredListingId) {
    const found = allOtherListings.find(l => l.id.toString() === featuredListingId);
    if (found) {
      featuredListing = found;
      otherListings = allOtherListings.filter(l => l.id.toString() !== featuredListingId);
    }
  }

  const hasTradeListings = allOtherListings.some(l => l.status === 'FOR_TRADE');
  const hasSaleListings = allOtherListings.some(l => l.status === 'FOR_SALE');

  return (
    <div style={{ maxWidth: (otherListings.length > 0 || featuredListing) ? '1500px' : '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 2rem 0 2rem' }}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← {language === 'ja' ? '戻る' : language === 'pt' ? 'Voltar' : 'Back'}
        </button>
      </div>
      <div 
        className={`page-container ${styles.pageLayout} ${(otherListings.length > 0 || featuredListing) ? styles.pageLayoutWithSidebar : ''}`}
        style={(otherListings.length > 0 || featuredListing) ? { maxWidth: '1500px', paddingTop: '1rem' } : { paddingTop: '1rem' }}
      >
      <div className={`${styles.detailContainer} glass-panel`}>
        <div className={styles.imageSection}>
          <img 
            src={getCardImage(card)} 
            alt={getCardName(card)} 
            className={styles.image} 
            onError={(e) => { 
              if (e.currentTarget.src !== card.imageUrl) {
                e.currentTarget.src = card.imageUrl; 
              }
            }} 
          />
        </div>
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{getCardName(card)}</h1>
          <div className={styles.badges}>
            <span className={styles.badge}>{card.type}</span>
            {card.attribute && <span className={styles.badge}>{card.attribute}</span>}
            {card.race && <span className={styles.badge}>{card.race}</span>}
            {card.archetype && <span className={styles.badge}>{card.archetype}</span>}
            {card.level && card.level > 0 && <span className={styles.badge}>Level {card.level}</span>}
            {card.linkval && card.linkval > 0 && <span className={styles.badge}>Link {card.linkval}</span>}
            {card.scale && card.scale > 0 && <span className={styles.badge}>Scale {card.scale}</span>}
          </div>
          
          <div className={styles.statsRow}>
            {card.attack !== null && <div className={styles.statBox}><span>ATK</span> <span>{card.attack}</span></div>}
            {card.defense !== null && <div className={styles.statBox}><span>DEF</span> <span>{card.defense}</span></div>}
          </div>

          <div className={styles.descriptionBox}>
            <h3>{t('cd_desc_title')}</h3>
            <p>{getCardDesc(card)}</p>
          </div>

          {card.cardSets && card.cardSets.length > 0 && (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                {language === 'ja' ? '収録セット' : language === 'pt' ? 'Coleções e Raridades' : 'Sets & Rarities'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {card.cardSets.map((cs: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {cs.setName && <div style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cs.setName}</div>}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{language === 'ja' ? 'コード: ' : language === 'pt' ? 'Código: ' : 'Set Code: '} <strong style={{ color: 'var(--text-primary)' }}>{cs.setCode}</strong></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{language === 'ja' ? 'レアリティ: ' : language === 'pt' ? 'Raridade: ' : 'Rarity: '} <strong style={{ color: 'var(--accent-gold)' }}>{cs.setRarity}</strong> {cs.setRarityCode && `(${cs.setRarityCode})`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.tradingSection}>
            <button 
              className="btn-primary" 
              onClick={handleOpenAddInventoryModal}
            >
              {t('prof_add_btn')}
            </button>
          </div>
        </div>
      </div>

      {(otherListings.length > 0 || featuredListing) && (
        <div className={`${styles.sidebar} glass-panel`} style={{ gap: '1.5rem' }}>
          {featuredListing && (
            <div style={{ flexShrink: 0 }}>
              <h2 style={{ color: 'var(--accent-gold)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.4rem' }}>
                {language === 'ja' ? '選択した提案' : language === 'pt' ? 'Proposta Selecionada' : 'Selected Proposal'}
              </h2>
              <div className={`${styles.marketListingCard} glass-panel`} style={{ marginTop: '1rem', border: '1px solid var(--accent-gold)', background: 'rgba(212, 175, 55, 0.05)' }}>
                <div className={cardStyles.cardInfo} style={{ padding: 0 }}>
                  <div className={cardStyles.owner} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    {t('listed_by')} <span style={{ color: 'var(--text-primary)' }}>{featuredListing.user?.username}</span>
                  </div>
                  
                  {featuredListing.condition && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      {language === 'ja' ? '状態: ' : language === 'pt' ? 'Condição: ' : 'Condition: '} 
                      <span style={{ color: 'var(--text-primary)' }}>{language === 'ja' ? featuredListing.condition.nameJa : language === 'pt' ? featuredListing.condition.namePt : featuredListing.condition.nameEn} ({featuredListing.condition.code})</span>
                    </div>
                  )}
                  
                  {featuredListing.rarity && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      {language === 'ja' ? 'レアリティ: ' : language === 'pt' ? 'Raridade: ' : 'Rarity: '} 
                      <span style={{ color: 'var(--text-primary)' }}>{featuredListing.rarity}</span>
                    </div>
                  )}
                  
                  <span style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }} className={`${cardStyles.statusBadge} ${featuredListing.status === 'FOR_SALE' ? cardStyles.statusSale : cardStyles.statusTrade}`}>
                    {featuredListing.status === 'FOR_SALE' ? t('for_sale') : t('for_trade')}
                  </span>
                  
                  {featuredListing.status === 'FOR_SALE' && <div className={cardStyles.price} style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{formatPrice(featuredListing.price)}</div>}
                  
                  {featuredListing.status === 'FOR_SALE' ? (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBuyCard(featuredListing); }} 
                      className={`btn-primary ${cardStyles.actionBtn}`}
                      style={{ marginTop: 'auto', position: 'relative', zIndex: 20 }}
                    >
                      {t('buy_now')}
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenTradeModalTarget(featuredListing); }} 
                      className={`btn-primary ${cardStyles.actionBtn}`}
                      style={{ marginTop: 'auto', position: 'relative', zIndex: 20 }}
                    >
                      {t('cd_trade_proposal')}
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenChat(featuredListing.user); }}
                    className={`btn-secondary ${cardStyles.actionBtn}`}
                    style={{ marginTop: '0.5rem', position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    💬 {t('chat_with')} {featuredListing.user.username}
                  </button>
                </div>
              </div>
            </div>
          )}

          {otherListings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
              <h2 style={{ color: featuredListing ? 'var(--text-secondary)' : 'var(--accent-gold)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', margin: '0 0 1rem 0', fontFamily: 'Cinzel, serif', fontSize: featuredListing ? '1.2rem' : '1.4rem', flexShrink: 0 }}>
                {language === 'ja' ? (featuredListing ? 'その他の出品' : 'マーケット出品') : language === 'pt' ? (featuredListing ? 'Outros Anúncios' : 'Anúncios do Mercado') : (featuredListing ? 'Other Listings' : 'Market Listings')}
              </h2>
              <div className={styles.sidebarList}>
            {otherListings.map(item => (
              <div key={`uc-${item.id}`} className={`${styles.marketListingCard} glass-panel`}>
                <div className={cardStyles.cardInfo} style={{ padding: 0 }}>
                  <div className={cardStyles.owner} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    {t('listed_by')} <span style={{ color: 'var(--text-primary)' }}>{item.user?.username}</span>
                  </div>
                  
                  {item.condition && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      {language === 'ja' ? '状態: ' : language === 'pt' ? 'Condição: ' : 'Condition: '} 
                      <span style={{ color: 'var(--text-primary)' }}>{language === 'ja' ? item.condition.nameJa : language === 'pt' ? item.condition.namePt : item.condition.nameEn} ({item.condition.code})</span>
                    </div>
                  )}
                  
                  {item.rarity && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      {language === 'ja' ? 'レアリティ: ' : language === 'pt' ? 'Raridade: ' : 'Rarity: '} 
                      <span style={{ color: 'var(--text-primary)' }}>{item.rarity}</span>
                    </div>
                  )}
                  
                  <span style={{ marginBottom: '0.5rem' }} className={`${cardStyles.statusBadge} ${item.status === 'FOR_SALE' ? cardStyles.statusSale : cardStyles.statusTrade}`}>
                    {item.status === 'FOR_SALE' ? t('for_sale') : t('for_trade')}
                  </span>
                  
                  {item.status === 'FOR_SALE' && <div className={cardStyles.price} style={{ marginBottom: '0.5rem' }}>{formatPrice(item.price)}</div>}
                  
                  {item.status === 'FOR_SALE' ? (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBuyCard(item); }} 
                      className={`btn-primary ${cardStyles.actionBtn}`}
                      style={{ marginTop: 'auto', position: 'relative', zIndex: 20 }}
                    >
                      {t('buy_now')}
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenTradeModalTarget(item); }} 
                      className={`btn-primary ${cardStyles.actionBtn}`}
                      style={{ marginTop: 'auto', position: 'relative', zIndex: 20 }}
                    >
                      {t('cd_trade_proposal')}
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenChat(item.user); }}
                    className={`btn-secondary ${cardStyles.actionBtn}`}
                    style={{ marginTop: '0.5rem', position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    💬 {t('chat_with')} {item.user.username}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}

      {showTradeModal && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
          <div className="glass-panel" style={{ width:'100%', maxWidth:'600px', padding:'2.5rem', display:'flex', flexDirection:'column', gap:'1.5rem', maxHeight:'90vh', overflowY:'auto' }}>
            <h2>{t('cd_modal_title')} {getCardName(card)}</h2>

            {modalLoading ? (
              <p>{t('cd_modal_searching')}</p>
            ) : availableListings.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>{t('cd_modal_no_duelists')}</p>
                <button type="button" onClick={() => setShowTradeModal(false)} className="btn-primary" style={{ marginTop: '1rem' }}>{t('cancel')}</button>
              </div>
            ) : (
              <form onSubmit={handleOfferTradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {tradeSuccess && <div style={{ color: '#4aff80', background: 'rgba(74, 255, 128, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(74, 255, 128, 0.3)' }}>{tradeSuccess}</div>}
                {tradeError && <div style={{ color: '#ff4a4a', background: 'rgba(255, 74, 74, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 74, 74, 0.3)' }}>{tradeError}</div>}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('cd_modal_select_duelist')}</label>
                  <select 
                    value={selectedListing?.id || ''} 
                    onChange={(e) => {
                      const found = availableListings.find(l => l.id === Number(e.target.value));
                      setSelectedListing(found || null);
                    }}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px' }}
                  >
                    {availableListings.map(l => (
                      <option key={l.id} value={l.id}>{l.user.username} (Listing #{l.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>{t('cd_modal_select_inventory')}</label>
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

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowTradeModal(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>{t('cancel')}</button>
                  <button type="submit" disabled={selectedMyCardIds.length === 0} className="btn-primary">{t('cd_modal_send_btn')}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
          <div className="glass-panel" style={{ width:'100%', maxWidth:'500px', padding:'2.5rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <h2>{t('prof_modal_add_title')}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
              <img 
                src={getCardImage(card)} 
                alt="" 
                style={{ width: '60px', height: '87px', objectFit: 'cover', borderRadius: '4px' }} 
                onError={(e) => { 
                  if (e.currentTarget.src !== card?.imageUrl) {
                    e.currentTarget.src = card?.imageUrl || ''; 
                  }
                }} 
              />
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{getCardName(card)}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{card?.type}</span>
              </div>
            </div>

            <form onSubmit={handleAddCardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('prof_modal_status')}</label>
                <select 
                  value={addStatus} 
                  onChange={(e) => setAddStatus(e.target.value)} 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px' }}
                >
                  <option value="COLLECTION">{t('prof_collection')}</option>
                  <option value="FOR_SALE">{t('for_sale')}</option>
                  <option value="FOR_TRADE">{t('for_trade')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{language === 'ja' ? 'カードの状態' : language === 'pt' ? 'Condição Física da Carta' : 'Physical Condition'}</label>
                <select 
                  value={addCondition} 
                  onChange={(e) => setAddCondition(e.target.value)} 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px' }}
                >
                  {conditions.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {language === 'ja' ? c.nameJa : language === 'pt' ? c.namePt : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {uniqueRarities.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{language === 'ja' ? 'レアリティ' : language === 'pt' ? 'Raridade' : 'Rarity'}</label>
                  <select 
                    value={addRarity} 
                    onChange={(e) => setAddRarity(e.target.value)} 
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px' }}
                  >
                    {uniqueRarities.map(r => (
                      <option key={r as string} value={r as string}>{r as string}</option>
                    ))}
                  </select>
                </div>
              )}

              {addStatus === 'FOR_SALE' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('prof_modal_price')}</label>
                  <input 
                    type="number" 
                    value={addPrice} 
                    onChange={(e) => setAddPrice(e.target.value)}
                    onFocus={() => {
                      // Se o valor for '0' ou 0, limpa o campo para facilitar a digitação do usuário
                      if (addPrice === '0' || Number(addPrice) === 0) {
                        setAddPrice('');
                      }
                    }}
                    onBlur={() => {
                      // Se o campo ficar vazio ao perder o foco, redefine para '0'
                      if (addPrice === '') {
                        setAddPrice('0');
                      }
                    }}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '4px' }}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? 'Adding...' : t('prof_modal_add_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChatModal && chatTargetUser && currentUser && (
        <ChatModal 
          currentUser={currentUser} 
          targetUser={chatTargetUser} 
          onClose={() => setShowChatModal(false)} 
          initialMessage={(() => {
            const cardName = getCardName(card);
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
    </div>
  );
}
