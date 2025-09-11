import React from 'react';
import type { HistoryItem } from '../types';
import { TrashIcon } from './Icons';

interface HistoryProps {
  history: HistoryItem[];
  activeTimestamp: number | null;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isLoading: boolean;
}

export const History: React.FC<HistoryProps> = ({ history, activeTimestamp, onSelect, onClear, isLoading }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-3 px-2">
        <h2 className="text-lg font-semibold text-[#8C766A]">Recent Creations</h2>
        <button
          onClick={onClear}
          disabled={isLoading}
          className="flex items-center gap-1 text-sm text-[#a18f85] hover:text-[#5D504A] disabled:opacity-50 transition-colors"
          aria-label="Clear history"
        >
          <TrashIcon />
          Clear
        </button>
      </div>
      <div className="p-3 bg-white/30 rounded-2xl border border-rose-100">
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.timestamp}>
              <button
                onClick={() => onSelect(item)}
                disabled={isLoading}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-[#5D504A] disabled:opacity-50 truncate ${
                  activeTimestamp === item.timestamp
                    ? 'bg-white font-semibold shadow'
                    : 'bg-transparent hover:bg-white/70'
                }`}
              >
                {item.prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
