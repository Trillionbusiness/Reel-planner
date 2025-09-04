

import React from 'react';
import type { DayPlan, ThirtyDayPlan } from '../types';
import { DownloadIcon, HtmlIcon, HookIcon, ScriptIcon, VisualsIcon, EditingIcon, CtaIcon, CheckIcon } from './Icons';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; small?: boolean }> = ({ icon, title, children, small }) => (
  <div className="pt-4 mt-4 border-t border-rose-100 first:mt-0 first:pt-0 first:border-0">
    <div className={`flex items-center font-semibold text-[#8C766A] mb-2 ${small ? 'text-base' : 'text-lg'}`}>
      {icon}
      <h3 className="ml-2">{title}</h3>
    </div>
    {children}
  </div>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start text-sm">
        <CheckIcon />
        <span className="ml-2 text-[#5D504A]">{children}</span>
    </li>
);

const DailyPlanView: React.FC<{ dayPlan: DayPlan }> = ({ dayPlan }) => {
    return (
        <details className="py-2 group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#EBC944] text-white font-bold rounded-full text-base shadow-sm">
                       {dayPlan.day}
                    </div>
                    <div className="flex-grow text-left">
                        <h3 className="font-semibold text-base text-[#5D504A] group-hover:text-[#D3A6A0] transition-colors">{dayPlan.ideaTitle}</h3>
                        <p className="text-sm text-[#8C766A] italic hidden sm:block">{`"${dayPlan.hook}"`}</p>
                    </div>
                </div>
                <div className="transition-transform duration-300 transform group-open:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path></svg>
                </div>
            </summary>
            <div className="mt-4 ml-0 sm:ml-14 pl-4 py-4 border-l-2 border-rose-100 bg-white/50 rounded-r-lg">
                 <Section icon={<HookIcon />} title="Viral Hook" small>
                    <p className="text-sm text-[#5D504A] italic">
                      "{dayPlan.hook}"
                    </p>
                </Section>
                <Section icon={<ScriptIcon />} title="Reel Script" small>
                    <div className="space-y-2 text-sm text-[#5D504A]">
                        <div>
                            <h4 className="font-semibold text-[#8C766A]">1. Hook:</h4>
                            <p>{dayPlan.script.hook}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#8C766A]">2. Problem:</h4>
                            <p>{dayPlan.script.conflict}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#8C766A]">3. Solution:</h4>
                            <p>{dayPlan.script.resolution}</p>
                        </div>
                    </div>
                </Section>
                 <Section icon={<VisualsIcon />} title="Visual Ideas" small>
                    <ul className="space-y-1">
                        {dayPlan.visualIdeas.map((idea, index) => <ListItem key={index}>{idea}</ListItem>)}
                    </ul>
                </Section>
                <Section icon={<EditingIcon />} title="Editing Tips" small>
                     <ul className="space-y-1">
                        {dayPlan.editingTips.map((tip, index) => <ListItem key={index}>{tip}</ListItem>)}
                    </ul>
                </Section>
                <Section icon={<CtaIcon />} title="Call to Action" small>
                    <p className="text-sm font-semibold text-white bg-[#D3A6A0] text-center rounded-md py-2 px-3">
                        {dayPlan.cta}
                    </p>
                </Section>
            </div>
        </details>
    );
};


interface ThirtyDayPlanModalProps {
  plan: ThirtyDayPlan;
  topic: string;
  onClose: () => void;
  onDownloadPdf: () => void;
  onDownloadHtml: () => void;
  pdfContentRef: React.RefObject<HTMLDivElement>;
}

export const ThirtyDayPlanModal: React.FC<ThirtyDayPlanModalProps> = ({ plan, topic, onClose, onDownloadPdf, onDownloadHtml, pdfContentRef }) => {

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-[#FDF8F5] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="p-5 border-b border-rose-200 flex justify-between items-center sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="text-[#5D504A]">
            <h2 className="text-xl font-bold">Your 30-Day Content Calendar</h2>
            <p className="text-sm text-[#8C766A]">Topic: "{topic}"</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none" aria-label="Close modal">&times;</button>
        </header>
        
        <div className="overflow-y-auto p-2 sm:p-4 md:p-6" id="pdf-container">
            <div ref={pdfContentRef} className="bg-[#FDF8F5] p-2 sm:p-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#5D504A]">30-Day Content Plan</h1>
                    <p className="text-xl text-[#8C766A]">Topic: "{topic}"</p>
                </div>
                
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-bold text-lg text-amber-900 mb-2">The Core Strategy: Your "Real Business"</h3>
                    <p className="text-amber-800">{plan.realBusinessJustification}</p>
                </div>

                <div className="grid grid-cols-1 divide-y divide-rose-200">
                    {plan.plan.sort((a,b) => a.day - b.day).map(dayPlan => (
                        <DailyPlanView 
                            key={dayPlan.day} 
                            dayPlan={dayPlan} 
                        />
                    ))}
                </div>
            </div>
        </div>

        <footer className="p-4 border-t border-rose-200 flex flex-wrap justify-end gap-3 sticky bottom-0 bg-[#FDF8F5]/80 backdrop-blur-sm z-10 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-[#8C766A] bg-rose-100 rounded-full hover:bg-rose-200 transition"
          >
            Close
          </button>
           <button 
            onClick={onDownloadHtml} 
            className="px-4 py-2 text-sm font-semibold text-white bg-[#8C766A] rounded-full hover:bg-[#7a655a] transition flex items-center gap-2"
          >
            <HtmlIcon />
            Download HTML
          </button>
          <button 
            onClick={onDownloadPdf} 
            className="px-4 py-2 text-sm font-semibold text-white bg-[#D3A6A0] rounded-full hover:bg-[#c99891] transition flex items-center gap-2"
          >
            <DownloadIcon />
            Download PDF
          </button>
        </footer>
      </div>
    </div>
  );
};