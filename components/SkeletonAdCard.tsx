import React from 'react';
import { StrategyIcon, TargetIcon, MoneyIcon, AdIcon, CheckIcon } from './Icons';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="border-t border-rose-100 pt-5 mt-5 first:border-t-0 first:mt-0 first:pt-0">
    <div className="flex items-center text-base sm:text-lg font-semibold text-[#8C766A] mb-3">
      {icon}
      <h3 className="ml-3">{title}</h3>
    </div>
    {children}
  </div>
);

const SkeletonBar: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`${width} ${height} bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);


const SkeletonAd: React.FC = () => (
    <details className="py-2 group">
        <summary className="flex items-center justify-between cursor-pointer list-none">
            <div className="flex items-start space-x-4 w-full">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-grow">
                    <SkeletonBar width="w-1/3" height="h-6" />
                    <SkeletonBar width="w-2/3" height="h-4" className="mt-2" />
                </div>
            </div>
        </summary>
    </details>
);

export const SkeletonAdCard: React.FC = () => {
  return (
    <div className="bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto backdrop-blur-sm border border-rose-100 animate-fade-in">
      
      <Section icon={<StrategyIcon />} title="Strategic Analysis">
        <div className="space-y-3">
            <SkeletonBar width="w-full" />
            <SkeletonBar width="w-5/6" />
            <SkeletonBar width="w-3/4" />
        </div>
      </Section>
      
      <Section icon={<TargetIcon />} title="Audience Targeting">
        <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><SkeletonBar width="w-1/2" className="mb-2"/><SkeletonBar /><SkeletonBar width="w-3/4"/></div>
            <div className="space-y-2"><SkeletonBar width="w-1/2" className="mb-2"/><SkeletonBar /><SkeletonBar width="w-3/4"/></div>
        </div>
      </Section>

       <Section icon={<MoneyIcon />} title="Budget Recommendation">
         <div className="space-y-2">
            <SkeletonBar width="w-1/3" height="h-6" />
            <SkeletonBar width="w-full" />
        </div>
      </Section>

      <Section icon={<AdIcon />} title="4-Week Ad Campaign">
        <div className="grid grid-cols-1 divide-y divide-rose-200">
            <SkeletonAd />
            <SkeletonAd />
            <SkeletonAd />
            <SkeletonAd />
        </div>
      </Section>
    </div>
  );
};