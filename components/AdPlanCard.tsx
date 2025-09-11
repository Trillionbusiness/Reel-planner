import React from 'react';
import type { Ad, AdPlan } from '../types';
import { StrategyIcon, TargetIcon, MoneyIcon, AdIcon, CheckIcon, ScriptIcon, VisualsIcon, HookIcon, EditingIcon, DownloadIcon, HtmlIcon } from './Icons';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }> = ({ icon, title, children, className = '' }) => (
  <div className={`border-t border-rose-100 pt-5 mt-5 first:border-t-0 first:mt-0 first:pt-0 ${className}`}>
    <div className="flex items-center text-base sm:text-lg font-semibold text-[#8C766A] mb-3">
      {icon}
      <h3 className="ml-3">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-[#8C766A]">{title}</h4>
        <div className="text-[#5D504A]">{children}</div>
    </div>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start text-sm">
        <CheckIcon />
        <span className="ml-2 text-[#5D504A]">{children}</span>
    </li>
);

const AdView: React.FC<{ ad: Ad }> = ({ ad }) => {
    return (
        <details className="py-4 group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#EBC944] text-white font-bold rounded-full text-lg shadow-sm">
                       {ad.week}
                    </div>
                    <div className="flex-grow text-left">
                        <h3 className="font-semibold text-lg text-[#5D504A] group-hover:text-[#D3A6A0] transition-colors">Week {ad.week}: {ad.adCopy.headline}</h3>
                        <p className="text-sm text-[#8C766A] italic hidden sm:block">{ad.valueProposition}</p>
                    </div>
                </div>
                <div className="transition-transform duration-300 transform group-open:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path></svg>
                </div>
            </summary>
            <div className="mt-4 ml-0 sm:ml-16 pl-4 py-4 border-l-2 border-rose-100 bg-white/50 rounded-r-lg space-y-4">
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <h4 className="font-bold text-[#8C766A] mb-2 flex items-center"><ScriptIcon/> <span className="ml-2">Ad Copy</span></h4>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Headline:</span> {ad.adCopy.headline}</p>
                        <p><span className="font-semibold">Primary Text:</span> {ad.adCopy.primaryText}</p>
                        <p><span className="font-semibold">Description:</span> {ad.adCopy.description}</p>
                        <p className="font-semibold text-center mt-2 rounded-md py-2 px-3 text-white bg-[#D3A6A0]">{ad.adCopy.cta}</p>
                    </div>
                </div>
                 <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 space-y-4">
                    <h4 className="font-bold text-[#8C766A] flex items-center"><VisualsIcon/> <span className="ml-2">Creative Brief</span></h4>
                    <div>
                        <h5 className="font-semibold text-[#8C766A] text-sm flex items-center mb-1"><HookIcon /> <span className="ml-2">Hook</span></h5>
                        <p className="text-sm text-[#5D504A] italic">"{ad.creativeBrief.hook}"</p>
                    </div>
                     <div>
                        <h5 className="font-semibold text-[#8C766A] text-sm flex items-center mb-1"><ScriptIcon /> <span className="ml-2">Script</span></h5>
                        <div className="space-y-1 text-sm text-[#5D504A] pl-4">
                           <p><span className="font-semibold">Hook:</span> {ad.creativeBrief.script.hook}</p>
                           <p><span className="font-semibold">Conflict:</span> {ad.creativeBrief.script.conflict}</p>
                           <p><span className="font-semibold">Resolution:</span> {ad.creativeBrief.script.resolution}</p>
                        </div>
                    </div>
                     <div>
                        <h5 className="font-semibold text-[#8C766A] text-sm flex items-center mb-1"><VisualsIcon /> <span className="ml-2">Visual Ideas</span></h5>
                        <ul className="space-y-1 pl-4">
                            {ad.creativeBrief.visualIdeas.map((idea, index) => <ListItem key={index}>{idea}</ListItem>)}
                        </ul>
                    </div>
                      <div>
                        <h5 className="font-semibold text-[#8C766A] text-sm flex items-center mb-1"><EditingIcon /> <span className="ml-2">Editing Tips</span></h5>
                        <ul className="space-y-1 pl-4">
                            {ad.creativeBrief.editingTips.map((tip, index) => <ListItem key={index}>{tip}</ListItem>)}
                        </ul>
                    </div>
                </div>
            </div>
        </details>
    );
};

interface AdPlanCardProps {
  plan: AdPlan;
  onDownloadPdf: () => void;
  onDownloadHtml: () => void;
}

export const AdPlanCard = React.forwardRef<HTMLDivElement, AdPlanCardProps>(({ plan, onDownloadPdf, onDownloadHtml }, ref) => {
  return (
    <>
      <div ref={ref}>
        <div className="bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto backdrop-blur-sm border border-rose-100">
          <Section icon={<StrategyIcon />} title="Strategic Analysis">
            <div className="space-y-4 text-sm">
                <DetailItem title="Primary Goal">{plan.strategicGoal}</DetailItem>
                <DetailItem title="Core Offer">{plan.coreOffer}</DetailItem>
                <DetailItem title="Target Audience Profile">
                    <p className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800">{plan.targetAudienceProfile}</p>
                </DetailItem>
            </div>
          </Section>
          
          <Section icon={<TargetIcon />} title="Audience Targeting">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <DetailItem title="Location">{plan.targeting.location}</DetailItem>
                <DetailItem title="Demographics">{plan.targeting.demographics}</DetailItem>
                <DetailItem title="Interests">
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {plan.targeting.interests.map(interest => <li key={interest} className="text-xs bg-rose-100 text-[#8C766A] px-2 py-1 rounded-full">{interest}</li>)}
                    </ul>
                </DetailItem>
                <DetailItem title="Pro Tip">
                    <p>{plan.targeting.lookalikeAudienceSuggestion}</p>
                </DetailItem>
            </div>
          </Section>
          
          <Section icon={<MoneyIcon />} title="Budget Recommendation">
            <div className="flex items-baseline gap-4">
                 <p className="text-3xl font-bold text-[#5D504A]">${plan.budget.monthly.toLocaleString()}<span className="text-base font-normal text-[#8C766A]">/month</span></p>
                 <p className="text-lg font-semibold text-[#8C766A]">${plan.budget.daily.toLocaleString()}<span className="text-sm font-normal">/day</span></p>
            </div>
            <p className="text-sm text-[#5D504A] mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">{plan.budget.justification}</p>
          </Section>

          <Section icon={<AdIcon />} title="4-Week Ad Campaign">
            <div className="grid grid-cols-1 divide-y divide-rose-200 -mt-4">
                {plan.monthlyPlan.sort((a,b) => a.week - b.week).map(ad => <AdView key={ad.week} ad={ad} />)}
            </div>
          </Section>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-6">
          <button 
              onClick={onDownloadHtml} 
              className="px-5 py-3 text-base font-semibold text-white bg-[#8C766A] rounded-full hover:bg-[#7a655a] transition flex items-center gap-2 shadow-md"
          >
              <HtmlIcon />
              Download HTML
          </button>
          <button 
              onClick={onDownloadPdf} 
              className="px-5 py-3 text-base font-semibold text-white bg-[#D3A6A0] rounded-full hover:bg-[#c99891] transition flex items-center gap-2 shadow-md"
          >
              <DownloadIcon />
              Download PDF
          </button>
      </div>
    </>
  );
});