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
                    <div className={styles.messageContent}>{msg.content}</div>
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
