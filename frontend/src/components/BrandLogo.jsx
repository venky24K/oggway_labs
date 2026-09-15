import React from 'react';

export default function BrandLogo({ size = 'medium', showSubtitle = true, compact = false }) {
  return (
    <div className={`brand-logo-container ${size}`}>
      {/* Bespoke Geometric Vector Mark (Acoustic pulse + growth trajectory) */}
      <div className="brand-logo-icon">
        <svg
          width="26"
          height="26"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="28" height="28" rx="7" fill="currentColor" fillOpacity="0.08" />
          <rect width="28" height="28" rx="7" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
          {/* Soundwave bars */}
          <path d="M7 15V13" stroke="var(--accent-primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 18V10" stroke="var(--accent-primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 21V7" stroke="var(--accent-primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 17V11" stroke="var(--accent-primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" />
          <path d="M23 15V13" stroke="var(--accent-primary, #3b82f6)" strokeWidth="2" strokeLinecap="round" />
          {/* Upward growth spark */}
          <circle cx="21" cy="7" r="1.75" fill="var(--accent-emerald, #10b981)" />
        </svg>
      </div>

      {!compact && (
        <div className="brand-logo-text-group">
          <div className="brand-logo-title">
            <span className="brand-name">LennyOS</span>
            <span className="brand-sub-badge">by Oggway Labs</span>
          </div>
          {showSubtitle && (
            <div className="brand-logo-desc">Product & Growth Intelligence</div>
          )}
        </div>
      )}
    </div>
  );
}
