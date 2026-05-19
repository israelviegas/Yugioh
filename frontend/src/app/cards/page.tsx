'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TiltCardWrapper from '@/components/TiltCardWrapper';
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

export default function CardsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search term to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch paginated cards from the backend
  useEffect(() => {
    setLoading(true);
    // Page starts at 0 in backend, but 1 in frontend
    const pageParam = currentPage - 1;
    const url = `${getApiUrl()}/api/cards?page=${pageParam}&size=${itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && 'content' in data) {
          setCards(Array.isArray(data.content) ? data.content : []);
          setTotalPages(data.totalPages || 1);
        } else {
          // Fallback if raw list is returned
          const cardsList = Array.isArray(data) ? data : [];
          setCards(cardsList);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cards:', err);
        setCards([]);
        setTotalPages(1);
        setLoading(false);
      });
  }, [currentPage, itemsPerPage, debouncedSearch]);

  // Reset page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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

  const paginatedCards = cards;

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
        <div className={styles.controls}>
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.itemsPerPageContainer}>
            <span>{t('cards_per_page')}</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
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

      {loading ? (
        <div className={styles.loading}>{t('summoning_cards')}</div>
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedCards.map(card => (
              <TiltCardWrapper 
                key={card.id} 
                className={`${styles.card} glass-panel`}
                onClick={() => router.push(`/cards/${card.id}`)}
              >
                <div className={styles.imageContainer}>
                  {card.imageUrl ? (
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
                  ) : (
                    <div className={styles.imagePlaceholder}>{t('no_image')}</div>
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{getCardName(card)}</h3>
                  <p className={styles.cardType}>{card.type}</p>
                  <div className={styles.stats}>
                    {card.attack !== null && <span>ATK: {card.attack}</span>}
                    {card.defense !== null && <span>DEF: {card.defense}</span>}
                  </div>
                </div>
              </TiltCardWrapper>
            ))}
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
    </div>
  );
}
