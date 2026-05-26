'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import ChatModal from '@/components/ChatModal';
import styles from './Messages.module.css';

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
  read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (!stored) {
        router.push('/login');
      } else {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
        } catch (e) {
          router.push('/login');
        }
      }
    }
  }, [router]);

  const fetchInbox = async (userId: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/messages/${userId}/inbox`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching inbox conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    fetchInbox(currentUser.id);
    const interval = setInterval(() => {
      fetchInbox(currentUser.id);
    }, 5000); // Poll inbox every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleOpenChat = async (partner: User) => {
    setSelectedPartner(partner);
    if (currentUser) {
      try {
        await fetch(`${getApiUrl()}/api/messages/${currentUser.id}/${partner.id}/read`, {
          method: 'PUT'
        });
        window.dispatchEvent(new Event('messages_read'));
      } catch (err) {
        console.error('Failed to mark conversation as read:', err);
      }
      setConversations(prev =>
        prev.map(c => {
          const cPartner = c.sender.id === currentUser.id ? c.receiver : c.sender;
          if (cPartner.id === partner.id) {
            return { ...c, read: true };
          }
          return c;
        })
      );
    }
  };

  const handleCloseChat = () => {
    setSelectedPartner(null);
    if (currentUser) {
      fetchInbox(currentUser.id); // Refresh immediately upon closing chat
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      // If it's today, show only time. Otherwise show date.
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (!currentUser) {
    return <div className={styles.loading}>{t('summoning_cards')}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('inbox_title')}</h1>
      </div>

      {loading && conversations.length === 0 ? (
        <div className={styles.loading}>{t('summoning_cards')}</div>
      ) : conversations.length === 0 ? (
        <div className={styles.noMessages}>{t('inbox_no_messages')}</div>
      ) : (
        <div className={styles.inboxList}>
          {conversations.map((msg) => {
            const partner = msg.sender.id === currentUser.id ? msg.receiver : msg.sender;
            const initials = partner.username ? partner.username.slice(0, 2).toUpperCase() : '??';
            const isUnread = !msg.read && msg.sender.id !== currentUser.id;

            return (
              <div 
                key={msg.id} 
                className={styles.conversationItem}
                onClick={() => handleOpenChat(partner)}
              >
                <div className={styles.leftSection}>
                  <div className={styles.avatar}>{initials}</div>
                  <div className={styles.details}>
                    <h3 className={styles.partnerName}>
                      {partner.username}
                      {isUnread && <span className={styles.unreadDot} style={{ marginLeft: '8px' }}></span>}
                    </h3>
                    <p className={`${styles.lastMsg} ${isUnread ? styles.unreadText : ''}`}>{msg.content}</p>
                  </div>
                </div>

                <div className={styles.rightSection}>
                  <span className={styles.timestamp} style={isUnread ? { fontWeight: 'bold', color: 'var(--accent-gold)' } : {}}>{formatTimestamp(msg.createdAt)}</span>
                  <button 
                    type="button" 
                    className={`btn-secondary ${styles.actionBtn}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(partner);
                    }}
                  >
                    💬 {language === 'ja' ? 'チャット' : language === 'pt' ? 'Conversar' : 'Chat'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPartner && (
        <ChatModal
          currentUser={currentUser}
          targetUser={selectedPartner}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}
