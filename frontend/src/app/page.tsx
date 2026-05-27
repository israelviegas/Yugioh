'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useLanguage();

  const handleExploreClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('catalog_page');
      sessionStorage.removeItem('catalog_filter');
      sessionStorage.removeItem('catalog_search');
      sessionStorage.removeItem('catalog_items');
      window.dispatchEvent(new Event('reset_catalog'));
    }
  };

  return (
    <div className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <h1 className={styles.title}>{t('home_hero_title')}</h1>
        <p className={styles.subtitle}>
          {t('home_hero_subtitle')}
        </p>
        <div className={styles.actions}>
          <Link href="/cards" onClick={handleExploreClick} className={`btn-primary ${styles.btnLarge}`}>
            {t('home_cta_explore')}
          </Link>
        </div>
      </div>
    </div>
  );
}
