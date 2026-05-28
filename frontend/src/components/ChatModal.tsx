import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatModal.module.css';
import { useLanguage } from '../context/LanguageContext';
import { getApiUrl } from '../config';

interface User {
  id: number;
  username: string;
}

interface Message {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
}

interface ChatModalProps {
  currentUser: User;
  targetUser: User;
  initialMessage?: string;
  onClose: () => void;
}

function MessageContent({ message }: { message: Message }) {
  const content = message.content;
  const [parsedContent, setParsedContent] = useState<React.ReactNode>(content);

  useEffect(() => {
    const regex = /(Olá, tenho interesse na sua carta|Hi, I have interest in your card|こんにちは、あなたのカードに興味があります)\s+([^!]+)(?:!)?/i;
    const match = content.match(regex);
    console.log("[MessageContent] content:", content, "match:", match);
    if (match) {
      const prefix = match[1];
      const cardNameText = match[2].trim(); // e.g. "A Case for K9" (PT-BR)
      
      const clean = (str: string) => str.replace(/"/g, '').replace(/\s+\((?:PT-BR|JP)\)$/i, '').toLowerCase().trim();
      const searchName = clean(cardNameText);
      
      let isCancelled = false;

      // Executa as requisições em paralelo para buscar a carta e a lista de anúncios
      Promise.all([
        fetch(`${getApiUrl()}/api/cards?search=${encodeURIComponent(searchName)}&size=5`).then(res => res.json()),
        fetch(`${getApiUrl()}/api/user-cards/market`).then(res => res.json())
      ])
      .then(([cardsData, marketData]) => {
        if (isCancelled) return;
        
        const cards = cardsData.content || cardsData;
        const marketListings = Array.isArray(marketData) ? marketData : [];
        
        if (Array.isArray(cards) && cards.length > 0) {
          const matchedCard = cards.find((c: any) => {
            const nameClean = clean(c.name || '');
            const namePtClean = clean(c.namePt || '');
            const nameJaClean = clean(c.nameJa || '');
            const targetClean = clean(cardNameText);
            return nameClean === targetClean || namePtClean === targetClean || nameJaClean === targetClean;
          }) || cards[0];

          if (matchedCard) {
            const cardId = matchedCard.id;
            
            // Procura o anúncio ativo da carta pertencente ao destinatário da mensagem (dono do anúncio)
            const matchedListing = marketListings.find((l: any) => 
              l.card.id === cardId && 
              l.user.id === message.receiver.id
            );
            
            const listingParam = matchedListing ? `?listing=${matchedListing.id}` : '';
            const href = `/cards/${cardId}${listingParam}`;
            
            const matchStr = match[0];
            const parts = content.split(matchStr);
            const hasExclamation = matchStr.endsWith('!');
            
            setParsedContent(
              <>
                {parts[0]}
                {prefix} <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {cardNameText}
                </a>
                {hasExclamation ? '!' : ''}
                {parts[1]}
              </>
            );
          }
        }
      })
      .catch(err => {
        console.error("Error looking up card for message link", err);
      });

      return () => {
        isCancelled = true;
      };
    }
  }, [content, message.receiver.id]);

  return <span>{parsedContent}</span>;
}

export default function ChatModal({ currentUser, targetUser, initialMessage, onClose }: ChatModalProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/messages/${currentUser.id}/${targetUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);

        // Check if any message from the target user is unread
        const hasUnread = Array.isArray(data) && data.some((msg: any) => msg.sender.id === targetUser.id && !msg.read);
        if (hasUnread) {
          await fetch(`${getApiUrl()}/api/messages/${currentUser.id}/${targetUser.id}/read`, {
            method: 'PUT'
          });
          window.dispatchEvent(new Event('messages_read'));
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [currentUser.id, targetUser.id]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch(`${getApiUrl()}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: targetUser.id,
          content: inputText
        })
      });

      if (res.ok) {
        setInputText('');
        fetchMessages(); // refresh instantly
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} glass-panel`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t('chat_with')} <span className={styles.targetName}>{targetUser.username}</span></h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.chatBox}>
          {loading && messages.length === 0 ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender.id === currentUser.id;
              return (
                <div key={msg.id} className={`${styles.messageWrapper} ${isMine ? styles.mine : styles.theirs}`}>
                  <div className={styles.messageBubble}>
                    <div className={styles.messageContent}><MessageContent message={msg} /></div>
                    <div className={styles.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSend}>
          <input 
            type="text" 
            className={styles.inputField} 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('chat_type_msg')}
          />
          <button type="submit" className="btn-primary" disabled={!inputText.trim()}>
            {t('chat_send')}
          </button>
        </form>
      </div>
    </div>
  );
}
