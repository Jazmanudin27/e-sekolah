import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SubHeader({ title, subtitle, onBack, rightAction }) {
  return (
    <div className="subheader-wrapper">
      <div className="subheader-inner">
        <button className="subheader-back-btn" onClick={onBack} title="Kembali ke Beranda">
          <ArrowLeft size={19} />
        </button>
        <div className="subheader-title-col">
          <h1 className="subheader-title">{title}</h1>
          {subtitle && <p className="subheader-subtitle">{subtitle}</p>}
        </div>
        {rightAction && (
          <div className="subheader-right-col" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}
