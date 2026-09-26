import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SubHeader({ title, subtitle, onBack }) {
  return (
    <div className="subheader-wrapper">
      <div className="subheader-inner">
        <button className="subheader-back-btn" onClick={onBack} title="Kembali ke Beranda">
          <ArrowLeft size={18} />
        </button>
        <div className="subheader-title-col">
          <h1 className="subheader-title">{title}</h1>
          {subtitle && <p className="subheader-subtitle">{subtitle}</p>}
        </div>
        <div className="subheader-right">
          <span className="subheader-badge">E-Sekolah</span>
        </div>
      </div>
    </div>
  );
}
