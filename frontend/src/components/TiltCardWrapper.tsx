'use client';

import React from 'react';

interface TiltCardWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  tiltOnly?: boolean;
}

export default function TiltCardWrapper({ children, className = '', style = {}, onClick }: TiltCardWrapperProps) {
  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
