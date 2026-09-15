import React from 'react';

export default function BrandLogo({ size = 'medium', showSubtitle = true, compact = false }) {
  const sizePixels = size === 'small' ? 26 : size === 'large' ? 42 : 34;

  return (
    <div className={`brand-logo-container ${size}`}>
      {/* Official Brand Icon */}
      <div className="brand-logo-icon">
        <img
          src="/logo-icon.png"
          alt="LennyOS Logo"
          style={{
            width: sizePixels,
            height: sizePixels,
            objectFit: 'contain',
            display: 'block'
          }}
        />
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
