'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Profile.module.css';

interface Card {
  id: number;
  name: string;
  namePt?: string;
  nameJa?: string;
  type: string;
  imageUrl: string;
  imageUrlPt?: string;
  imageUrlJa?: string;
}

interface UserCard {
  id: number;
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

interface Trade {
  id: number;
  sender: { id: number; username: string };
  receiver: { id: number; username: string };
  offeredCards: UserCard[];
  requestedCards: UserCard[];
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, language, formatPrice, currencySymbol } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState<any[]>([]);
  // Controla o preço digitado localmente — só salva no servidor ao sair do campo
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({});

  // Modal Add Card
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | ''>('');
  const [newStatus, setNewStatus] = useState('COLLECTION');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Edit Profile Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (!stored) {
        router.push('/login');
      } else {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        fetchData(parsedUser.id);
      }
    }
  }, [router]);

  const fetchData = async (userId: number) => {
    setLoading(true);
    try {
      const [cardsRes, tradesRes, conditionsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/users/${userId}/cards`),
        fetch(`${getApiUrl()}/api/trades/user/${userId}`),
        fetch(`${getApiUrl()}/api/conditions`)
      ]);
      const cardsData = await cardsRes.json();
      const tradesData = await tradesRes.json();
      if (conditionsRes.ok) {
        const condData = await conditionsRes.json();
        setConditions(Array.isArray(condData) ? condData : []);
      }
      setUserCards(Array.isArray(cardsData) ? cardsData : []);
      setTrades(Array.isArray(tradesData) ? tradesData : []);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setUserCards([]);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    router.push('/cards');
  };

  const handleOpenEditProfile = () => {
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPassword('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          email: editEmail,
          password: editPassword || undefined
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('yugioh_user', JSON.stringify(updatedUser));
        setShowEditProfileModal(false);
        alert(t('prof_edit_success'));
      } else {
        alert(t('prof_edit_error'));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(t('prof_edit_error'));
    }
  };

  // Dynamic autocomplete search for the Add to Inventory modal
  useEffect(() => {
    if (!showAddModal) return;
    if (searchText.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setIsSearching(true);
      fetch(`${getApiUrl()}/api/cards?search=${encodeURIComponent(searchText)}&size=8`)
        .then((res) => res.json())
        .then((data) => {
          const cardsList = data && typeof data === 'object' && 'content' in data
            ? data.content
            : (Array.isArray(data) ? data : []);
          setSuggestions(cardsList);
          setIsSearching(false);
        })
        .catch((err) => {
          console.error('Error fetching autocomplete suggestions:', err);
          setSuggestions([]);
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText, showAddModal]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !user) return;

    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cardId: Number(selectedCardId),
          status: newStatus,
          price: Number(newPrice)
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchData(user.id);
      }
    } catch (err) {
      console.error('Error adding card:', err);
    }
  };

  const handleUpdateCard = async (id: number, status: string, price: number, conditionCode?: string) => {
    try {
      const bodyPayload: any = { status, price };
      if (conditionCode) {
        bodyPayload.conditionCode = conditionCode;
      }
      const res = await fetch(`${getApiUrl()}/api/user-cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        fetchData(user.id);
      }
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/user-cards/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(user.id);
      }
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleSyncCards = async () => {
    if (!confirm(t('prof_sync_confirm'))) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/sync-cards`, {
        method: 'POST'
      });
      if (res.ok) {
        alert(t('prof_sync_success'));
      } else {
        alert(t('prof_sync_error'));
      }
    } catch (err) {
      console.error('Error syncing cards:', err);
      alert(t('prof_sync_comm_error'));
    }
  };

  const handleRespondTrade = async (tradeId: number, status: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/trades/${tradeId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData(user.id);
      }
    } catch (err) {
      console.error('Error responding trade:', err);
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

  if (!user) return null;

  const filteredCards = userCards.filter(uc => {
    if (activeTab === 'ALL') return true;
    return uc.status === activeTab;
  });

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <h1 className={styles.username}>
            {user.username}
            <button onClick={handleOpenEditProfile} style={{ marginLeft: '1rem', fontSize: '0.9rem', padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: '4px', cursor: 'pointer' }}>
              {t('prof_edit_profile')}
            </button>
          </h1>
          <span className={styles.email}>{user.email}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'ADMIN' && (
            <button onClick={handleSyncCards} className={`btn-primary ${styles.addCardBtn}`}>
              {t('prof_sync_api')}
            </button>
          )}
          <button onClick={handleOpenAddModal} className={`btn-primary ${styles.addCardBtn}`}>
            {t('prof_add_btn')}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.sidebar} glass-panel`}>
          <button 
            type="button"
            className={`${styles.menuItem} ${activeTab === 'ALL' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <span>{t('prof_all_cards')}</span>
            <span>{userCards.length}</span>
          </button>
          <button 
            type="button"
            className={`${styles.menuItem} ${activeTab === 'COLLECTION' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('COLLECTION')}
          >
            <span>{t('prof_collection')}</span>
            <span>{userCards.filter(c => c.status === 'COLLECTION').length}</span>
          </button>
          <button 
            type="button"
            className={`${styles.menuItem} ${activeTab === 'FOR_SALE' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('FOR_SALE')}
          >
            <span>{t('for_sale')}</span>
            <span>{userCards.filter(c => c.status === 'FOR_SALE').length}</span>
          </button>
          <button 
            type="button"
            className={`${styles.menuItem} ${activeTab === 'FOR_TRADE' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('FOR_TRADE')}
          >
            <span>{t('for_trade')}</span>
            <span>{userCards.filter(c => c.status === 'FOR_TRADE').length}</span>
          </button>
          <button 
            type="button"
            className={`${styles.menuItem} ${activeTab === 'TRADES' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('TRADES')}
          >
            <span>{t('prof_trade_offers')}</span>
            <span>{trades.length}</span>
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>{t('prof_loading')}</div>
          ) : activeTab === 'TRADES' ? (
            <div>
              <h2 className={styles.sectionTitle}>{t('prof_proposals_title')}</h2>
              <div className={styles.tradesList}>
                {trades.map(trade => {
                  const isReceiver = trade.receiver.id === user.id;
                  return (
                    <div key={trade.id} className={`${styles.tradeItem} glass-panel`}>
                      <div className={styles.tradeHeader}>
                        <span className={styles.tradeParticipants}>
                          {trade.sender.username} ➔ {trade.receiver.username}
                        </span>
                        <span className={`${styles.tradeStatus} ${
                          trade.status === 'PENDING' ? styles.statusPending : 
                          trade.status === 'ACCEPTED' ? styles.statusAccepted : styles.statusRejected
                        }`}>
                          {trade.status}
                        </span>
                      </div>

                      <div className={styles.tradeBody}>
                        <div className={styles.tradeBox}>
                          <div className={styles.tradeBoxTitle}>{t('prof_offered_cards')}</div>
                          <div className={styles.miniCardList}>
                            {trade.offeredCards.map(uc => (
                              <div key={uc.id} className={styles.miniCard}>
                                <img 
                                  src={getCardImage(uc.card)} 
                                  alt="" 
                                  className={styles.miniCardImg} 
                                  onError={(e) => { 
                                    if (e.currentTarget.src !== uc.card.imageUrl) {
                                      e.currentTarget.src = uc.card.imageUrl; 
                                    }
                                  }} 
                                />
                                <span>{getCardName(uc.card)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.tradeBox}>
                          <div className={styles.tradeBoxTitle}>{t('prof_requested_cards')}</div>
                          <div className={styles.miniCardList}>
                            {trade.requestedCards.map(uc => (
                              <div key={uc.id} className={styles.miniCard}>
                                <img 
                                  src={getCardImage(uc.card)} 
                                  alt="" 
                                  className={styles.miniCardImg} 
                                  onError={(e) => { 
                                    if (e.currentTarget.src !== uc.card.imageUrl) {
                                      e.currentTarget.src = uc.card.imageUrl; 
                                    }
                                  }} 
                                />
                                <span>{getCardName(uc.card)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {trade.status === 'PENDING' && isReceiver && (
                        <div className={styles.tradeActions}>
                          <button onClick={() => handleRespondTrade(trade.id, 'ACCEPTED')} className={styles.acceptBtn}>{t('prof_accept_btn')}</button>
                          <button onClick={() => handleRespondTrade(trade.id, 'REJECTED')} className={styles.rejectBtn}>{t('prof_reject_btn')}</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {trades.length === 0 && <p>No trade proposals found.</p>}
              </div>
            </div>
          ) : (
            <div>
              <h2 className={styles.sectionTitle}>{activeTab} Inventory</h2>
              <div className={styles.cardsGrid}>
                {filteredCards.map(uc => (
                  <div key={uc.id} className={`${styles.cardItem} glass-panel`}>
                    <img 
                      src={getCardImage(uc.card)} 
                      alt={getCardName(uc.card)} 
                      className={styles.cardImg} 
                      onError={(e) => { 
                        if (e.currentTarget.src !== uc.card.imageUrl) {
                          e.currentTarget.src = uc.card.imageUrl; 
                        }
                      }} 
                    />
                    <h3 className={styles.cardName}>{getCardName(uc.card)}</h3>
                    <span className={styles.cardStatus}>{uc.status}</span>
                    {uc.status === 'FOR_SALE' && <span className={styles.cardPrice}>{formatPrice(uc.price)}</span>}

                    <div className={styles.cardActions}>
                      <select 
                        value={uc.status} 
                        onChange={(e) => handleUpdateCard(uc.id, e.target.value, uc.price, uc.condition?.code)}
                        className={styles.actionSelect}
                      >
                        <option value="COLLECTION">{t('prof_collection')}</option>
                        <option value="FOR_SALE">{t('for_sale')}</option>
                        <option value="FOR_TRADE">{t('for_trade')}</option>
                      </select>

                      <select 
                        value={uc.condition?.code || 'NM'} 
                        onChange={(e) => handleUpdateCard(uc.id, uc.status, uc.price, e.target.value)}
                        className={styles.actionSelect}
                      >
                        {conditions.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {language === 'ja' ? c.nameJa : language === 'pt' ? c.namePt : c.nameEn}
                          </option>
                        ))}
                      </select>

                      {uc.status === 'FOR_SALE' && (
                        <input 
                          type="number"
                          value={editingPrices[uc.id] ?? uc.price}
                          onChange={(e) =>
                            setEditingPrices(prev => ({ ...prev, [uc.id]: e.target.value }))
                          }
                          onBlur={() => {
                            const val = Number(editingPrices[uc.id] ?? uc.price);
                            handleUpdateCard(uc.id, uc.status, val, uc.condition?.code);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = Number(editingPrices[uc.id] ?? uc.price);
                              handleUpdateCard(uc.id, uc.status, val, uc.condition?.code);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={styles.actionInput}
                          placeholder="Price"
                        />
                      )}

                      <button onClick={() => handleDeleteCard(uc.id)} className={styles.deleteBtn}>
                        {t('prof_remove_btn')}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredCards.length === 0 && <p>No cards found in this section.</p>}
              </div>
            </div>
          )}
        </div>
      </div>



      {showEditProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`}>
            <h2 className={styles.modalTitle}>{t('prof_edit_modal_title')}</h2>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('prof_edit_username')}</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className={styles.modalSelect}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('prof_edit_email')}</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={styles.modalSelect}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('prof_edit_password')}</label>
                <input
                  type="password"
                  placeholder={t('prof_edit_password_ph')}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className={styles.modalSelect}
                  style={{ width: '100%' }}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowEditProfileModal(false)} className={styles.cancelBtn}>{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('prof_edit_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
