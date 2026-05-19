'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <h1 className={styles.title}>{t('home_hero_title')}</h1>
        <p className={styles.subtitle}>
          {t('home_hero_subtitle')}
        </p>
        <div className={styles.actions}>
          <Link href="/cards" className={`btn-primary ${styles.btnLarge}`}>
            {t('home_cta_explore')}
          </Link>
          <Link href="/marketplace" className={`glass-panel ${styles.btnSecondary}`}>
            {t('home_cta_market')}
          </Link>
        </div>
      </div>
    </div>
  );
}
