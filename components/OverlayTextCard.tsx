import React, { useState } from 'react';
import type { OverlayText } from '../types';
import { StrategyIcon, TextIcon, CopyIcon, CheckIcon } from './Icons';

interface OverlayTextCardProps {
  plan: OverlayText;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="border-t border-rose-100 pt-5 mt-5 first:border-t-0 first:mt-0 first:pt-0">
    <div className="flex items-center text-base sm:text-lg font-semibold text-[#8C766A] mb-3">
      {icon}
      <h3 className="ml-3">{title}</h3>
    </div>
    {children}
  </div>
);

const ListItem: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <li className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-rose-50 transition-colors">
            <p className="text-[#5D504A]">{text}</p>
            <button 
                onClick={handleCopy}
                className="flex-shrink-0 p-2 rounded-md transition-all text-gray-400 group-hover:text-[#D3A6A0] hover:!text-white hover:bg-[#D3A6A0] opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Copy text"
            >
                {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
        </li>
    );
};


export const OverlayTextCard: React.FC<OverlayTextCardProps> = ({ plan }) => {
  return (
    <div className="bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto backdrop-blur-sm border border-rose-100 animate-fade-in">
      
      <Section icon={<TextIcon />} title={plan.title}>
        <ul className="divide-y divide-rose-100">
            {plan.texts.map((text, index) => <ListItem key={index} text={text} />)}
        </ul>
      </Section>
      
      <Section icon={<StrategyIcon />} title="Strategy Justification">
        <p className="text-base text-[#5D504A] bg-amber-50 p-3 rounded-lg border border-amber-200">
          {plan.justification}
        </p>
      </Section>

    </div>
  );
};
