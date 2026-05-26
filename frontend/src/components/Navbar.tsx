'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState('dark');
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yugioh_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuth();

    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('yugioh_theme');
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initialTheme = prefersLight ? 'light' : 'dark';
        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
      }
    }

    window.addEventListener('auth_change', checkAuth);
    return () => {
      window.removeEventListener('auth_change', checkAuth);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('yugioh_theme', newTheme);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yugioh_user');
      localStorage.removeItem('yugioh_token');
      setUser(null);
      window.dispatchEvent(new Event('auth_change'));
      router.push('/');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          DuelistHub
        </Link>
        <div className={styles.links}>
          <Link href="/cards" className={`${styles.link} ${pathname.startsWith('/cards') ? styles.activeLink : ''}`}>{t('nav_cards')}</Link>
          <Link href="/strategies" className={`${styles.link} ${pathname.startsWith('/strategies') ? styles.activeLink : ''}`}>{t('nav_strategies')}</Link>
          {user && (
            <>
              <Link href="/profile" className={`${styles.link} ${pathname.startsWith('/profile') ? styles.activeLink : ''}`}>{t('nav_inventory')}</Link>
              <Link href="/messages" className={`${styles.link} ${pathname.startsWith('/messages') ? styles.activeLink : ''}`}>{t('nav_messages')}</Link>
            </>
          )}
          
          <div className={styles.langSelector}>
            <button 
              onClick={() => setLanguage('pt')} 
              className={`${styles.langBtn} ${language === 'pt' ? styles.activeLang : ''}`}
              title="Português (Brasil)"
            >
              🇧🇷 PT
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={`${styles.langBtn} ${language === 'en' ? styles.activeLang : ''}`}
              title="English"
            >
              🇺🇸 EN
            </button>
            <button 
              onClick={() => setLanguage('ja')} 
              className={`${styles.langBtn} ${language === 'ja' ? styles.activeLang : ''}`}
              title="日本語"
            >
              🇯🇵 JA
            </button>
          </div>

          <button onClick={toggleTheme} className={styles.themeToggleBtn} title="Alternar Tema (Light/Dark)">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {user ? (
            <div className={styles.userInfo}>
              <Link href="/profile" className={`${styles.link} ${pathname.startsWith('/profile') ? styles.activeLink : ''}`}>
                <span className={styles.username}>{user.username}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>{t('nav_logout')}</button>
            </div>
          ) : (
            <Link href="/login" className={`btn-primary ${styles.loginBtn}`}>{t('nav_login')}</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
