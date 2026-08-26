import React from 'react';
import { GroundingMetadata } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface SourceChipsProps {
  metadata?: GroundingMetadata;
}

export const SourceChips: React.FC<SourceChipsProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  // Filter out chunks that don't have web data
  const webSources = metadata.groundingChunks.filter(chunk => chunk.web);

  if (webSources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <h4 className="text-[10px] font-black text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-widest">
        <Globe className="w-3.5 h-3.5 text-neuro-blue" />
        Fuentes / Sources (Grounding)
      </h4>
      <div className="flex flex-wrap gap-2">
        {webSources.map((chunk, index) => (
          <a
            key={index}
            href={chunk.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 hover:border-neuro-blue/40 rounded-xl text-xs text-neuro-blue hover:bg-neuro-blue/10 transition-all font-bold"
          >
            <span className="truncate max-w-[150px]">{chunk.web?.title || "Source"}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        ))}
      </div>
    </div>
  );
};