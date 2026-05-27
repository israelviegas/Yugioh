'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Strategies.module.css';

interface Strategy {
  id: number;
  title: string;
  titlePt?: string;
  titleJa?: string;
  content: string;
  contentPt?: string;
  contentJa?: string;
  createdAt: string;
  videoUrl?: string;
  author: {
    username: string;
  };
}

export default function StrategiesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
    fetchStrategies();
  }, []);

  const fetchStrategies = () => {
    setLoading(true);
    fetch(`${getApiUrl()}/api/strategies`)
      .then((res) => res.json())
      .then((data) => {
        setStrategies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching strategies:', err);
        setStrategies([]);
        setLoading(false);
      });
  };

  const handleOpenModal = () => {
    if (!currentUser) {
      // Alerta solicitando login para compartilhar estratégias (respeita o idioma selecionado)
      alert(t('strat_login_required'));
      router.push('/login');
      return;
    }
    setShowModal(true);
    setTitle('');
    setContent('');
    setVideoUrl('');
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await fetch(`${getApiUrl()}/api/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          title,
          content,
          videoUrl
        })
      });

      if (!res.ok) {
        throw new Error('Failed to publish strategy');
      }

      // Mensagem de sucesso traduzida ao publicar estratégia
      setSubmitSuccess(t('strat_success_msg'));
      setTimeout(() => {
        setShowModal(false);
        fetchStrategies();
        setSubmitting(false);
      }, 1500);
    } catch (err: any) {
      // Mensagem de erro traduzida em caso de falha no envio
      setSubmitError(err.message || t('strat_error_msg'));
      setSubmitting(false);
    }
  };

  const getStratTitle = (s: Strategy) => {
    if (language === 'pt') return s.titlePt || s.title;
    if (language === 'ja') return s.titleJa || s.title;
    return s.title;
  };

  const getStratContent = (s: Strategy) => {
    if (language === 'pt') return s.contentPt || s.content;
    if (language === 'ja') return s.contentJa || s.content;
    return s.content;
  };

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>{t('strat_title')}</h1>
        <button onClick={handleOpenModal} className="btn-primary">{t('strat_share_btn')}</button>
      </div>

      {loading ? (
        <div className={styles.loading}>{t('strat_summoning')}</div>
      ) : (
        <div className={styles.list}>
          {strategies.map(strategy => (
            <div key={strategy.id} className={`${styles.strategyCard} glass-panel`}>
              <h2 className={styles.strategyTitle}>{getStratTitle(strategy)}</h2>
              <div className={styles.meta}>
                {t('strat_published')} <span className={styles.author}>{strategy.author?.username}</span> on {new Date(strategy.createdAt).toLocaleDateString()}
              </div>
              <p className={styles.content}>{getStratContent(strategy)}</p>
              {strategy.videoUrl && (
                <div style={{ marginTop: '1.5rem' }}>
                  <a href={strategy.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>
                    🎥 {t('strat_watch_video')}
                  </a>
                </div>
              )}
            </div>
          ))}
          {strategies.length === 0 && !loading && (
            <p className={styles.empty}>{t('strat_empty_list')}</p>
          )}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`}>
            <h2 className={styles.modalTitle}>{t('strat_modal_title')}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {submitError && <div style={{ color: '#ff4a4a', background: 'rgba(255, 74, 74, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255, 74, 74, 0.3)' }}>{submitError}</div>}
              {submitSuccess && <div style={{ color: '#4aff80', background: 'rgba(74, 255, 128, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(74, 255, 128, 0.3)' }}>{submitSuccess}</div>}

              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('strat_modal_label_title')}</label>
                <input 
                  type="text" 
                  required 
                  className={styles.input} 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('strat_placeholder_title')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('strat_modal_label_content')}</label>
                <textarea 
                  required 
                  className={styles.textarea} 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('strat_placeholder_content')}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('strat_modal_label_video')}</label>
                <input 
                  type="url" 
                  className={styles.input} 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn} disabled={submitting}>{t('cancel')}</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? t('strat_publishing') : t('publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
