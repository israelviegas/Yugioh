'use client';

import React, { useRef, useState, useEffect } from 'react';

interface TiltCardWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Se true, desativa o zoom (scale) — apenas tilt 3D seguindo o mouse */
  tiltOnly?: boolean;
}

export default function TiltCardWrapper({ children, className = '', style = {}, onClick, tiltOnly = false }: TiltCardWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState('');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
      setIsMobile(checkMobile);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    const x = (left / width) - 0.5;
    const y = (top / height) - 0.5;

    const maxRotate = 18;
    const rotateX = -(y * maxRotate).toFixed(2);
    const rotateY = (x * maxRotate).toFixed(2);
    const translateX = (x * 12).toFixed(1);
    const translateY = (y * 12).toFixed(1);

    if (tiltOnly) {
      // Sem zoom — apenas tilt 3D + translação suave
      setTransformStyle(
        `perspective(1000px) translate3d(${translateX}px, ${translateY}px, 10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      );
    } else {
      setTransformStyle(
        `perspective(1000px) scale(1.25) translate3d(${translateX}px, ${translateY}px, 20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      );
    }

    const angle = Math.atan2(y, x) * (180 / Math.PI) - 90;
    const opacity = Math.min(Math.max(Math.sqrt(x * x + y * y) * 1.5, 0), 0.5);

    setGlareStyle({
      background: `linear-gradient(${angle}deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 80%)`,
      opacity: 1,
    });
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
    if (tiltOnly) {
      setTransformStyle('perspective(1000px) translate3d(0px, 0px, 10px) rotateX(0deg) rotateY(0deg)');
    } else {
      setTransformStyle('perspective(1000px) scale(1.25) translate3d(0px, 0px, 20px) rotateX(0deg) rotateY(0deg)');
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
    setTransformStyle('perspective(1000px) scale(1) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-wrapper ${className}`}
      style={{
        ...style,
        transform: isHovered ? transformStyle : style.transform || 'perspective(1000px) scale(1) translate3d(0,0,0) rotateX(0) rotateY(0)',
        transition: isHovered ? 'transform 0.08s ease-out, box-shadow 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease',
        position: 'relative',
        zIndex: isHovered ? 30 : 1,
        willChange: 'transform, box-shadow',
        transformStyle: 'preserve-3d',
        boxShadow: isHovered
          ? '0 25px 50px rgba(212, 175, 55, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)'
          : style.boxShadow || 'var(--glass-shadow)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}

      {!isMobile && (
        <div
          className="tilt-card-glare"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease',
            zIndex: 10,
            ...glareStyle,
          }}
        />
      )}
    </div>
  );
}
