'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = isLogin 
      ? `${getApiUrl()}/api/users/login` 
      : `${getApiUrl()}/api/users/register`;

    const body = isLogin 
      ? JSON.stringify({ email, password })
      : JSON.stringify({ username, email, password });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('yugioh_token', data.token);
      localStorage.setItem('yugioh_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth_change'));

      setSuccess(isLogin ? 'Login successful! Summoning duelist...' : 'Registration successful! Summoning duelist...');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className={styles.container}>
        <div className={`${styles.authCard} glass-panel`}>
          <div className={styles.tabs}>
            <button 
              type="button"
              className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            >
              {t('log_login_tab')}
            </button>
            <button 
              type="button"
              className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            >
              {t('log_reg_tab')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('log_user_label')}</label>
                <input 
                  type="text" 
                  required 
                  className={styles.input} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="YugiMuto"
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('log_email_label')}</label>
              <input 
                type="email" 
                required 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="duelist@domain.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('log_pass_label')}</label>
              <input 
                type="password" 
                required 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className={`btn-primary ${styles.submitBtn}`}>
              {loading ? t('log_summoning') : isLogin ? t('log_btn_enter') : t('log_btn_create')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
