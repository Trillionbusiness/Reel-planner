
import React from 'react';
import { IdeaIcon, HookIcon, ScriptIcon, VisualsIcon, EditingIcon, CtaIcon, CheckIcon } from './Icons';

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="border-t border-rose-100 pt-5 mt-5">
    <div className="flex items-center text-base sm:text-lg font-semibold text-[#8C766A] mb-3">
      {icon}
      <h3 className="ml-3">{title}</h3>
    </div>
    {children}
  </div>
);

const SkeletonBar: React.FC<{ width?: string; height?: string }> = ({ width = 'w-full', height = 'h-4' }) => (
    <div className={`${width} ${height} bg-gray-200 rounded-md animate-pulse`}></div>
);

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto backdrop-blur-sm border border-rose-100 animate-fade-in">
      
      <Section icon={<IdeaIcon />} title="Content Idea">
        <SkeletonBar width="w-3/4" height="h-7" />
      </Section>

      <Section icon={<HookIcon />} title="Viral Hook">
        <div className="space-y-2">
            <SkeletonBar width="w-full" height="h-5" />
            <SkeletonBar width="w-5/6" height="h-5" />
        </div>
      </Section>

      <Section icon={<ScriptIcon />} title="Reel Script">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-[#8C766A]">1. The Hook</h4>
            <div className="space-y-2 mt-1">
                <SkeletonBar />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#8C766A]">2. The Problem/Conflict</h4>
            <div className="space-y-2 mt-1">
                <SkeletonBar />
                <SkeletonBar width="w-1/2" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#8C766A]">3. The Solution/Resolution</h4>
            <div className="space-y-2 mt-1">
                <SkeletonBar />
                <SkeletonBar width="w-3/4" />
            </div>
          </div>
        </div>
      </section>

      <Section icon={<VisualsIcon />} title="Visual Ideas">
        <ul className="space-y-3">
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
        </ul>
      </Section>
      
      <Section icon={<EditingIcon />} title="Editing Tips">
        <ul className="space-y-3">
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
            <li className="flex items-start"><CheckIcon /><div className="ml-2 w-full"><SkeletonBar height="h-5"/></div></li>
        </ul>
      </section>

      <Section icon={<CtaIcon />} title="Call to Action">
         <SkeletonBar height="h-12" />
      </Section>
    </div>
  );
};
