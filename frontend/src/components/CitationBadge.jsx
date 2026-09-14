import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

export default function CitationBadge({ citation }) {
  if (!citation) return null;

  const { guest, title, timestamp, youtube_url, snippet } = citation;

  return (
    <a
      href={youtube_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="citation-badge"
      title={`${title} - "${snippet || ''}"`}
    >
      <Play size={12} fill="currentColor" />
      <span className="badge-guest">{guest}</span>
      <span className="badge-time">{timestamp}</span>
      <ExternalLink size={10} style={{ opacity: 0.7 }} />
    </a>
  );
}
