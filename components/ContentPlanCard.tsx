import React from 'react';
import type { ContentPlan } from '../types';
import { StrategyIcon, IdeaIcon, HookIcon, ScriptIcon, VisualsIcon, EditingIcon, CtaIcon, CheckIcon } from './Icons';

interface ContentPlanCardProps {
  plan: ContentPlan;
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

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <CheckIcon />
        <span className="ml-2 text-[#5D504A]">{children}</span>
    </li>
);

export const ContentPlanCard: React.FC<ContentPlanCardProps> = ({ plan }) => {
  return (
    <div className="bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-3xl mx-auto backdrop-blur-sm border border-rose-100 animate-fade-in">
      
      <Section icon={<StrategyIcon />} title="Your Core Strategy: The 'Real Business'">
        <p className="text-base text-[#5D504A] bg-amber-50 p-3 rounded-lg border border-amber-200">
          {plan.realBusinessJustification}
        </p>
      </Section>
      
      <Section icon={<IdeaIcon />} title="Content Idea">
        <h2 className="text-xl sm:text-2xl font-bold text-[#5D504A]">{plan.ideaTitle}</h2>
      </Section>

      <Section icon={<HookIcon />} title="Viral Hook">
        <p className="text-base sm:text-lg text-[#5D504A] italic">
          "{plan.hook}"
        </p>
      </Section>

      <Section icon={<ScriptIcon />} title="Reel Script">
        <div className="space-y-4 text-[#5D504A]">
          <div>
            <h4 className="font-semibold text-[#8C766A]">1. The Hook</h4>
            <p>{plan.script.hook}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#8C766A]">2. The Problem/Conflict</h4>
            <p>{plan.script.conflict}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#8C766A]">3. The Solution/Resolution</h4>
            <p>{plan.script.resolution}</p>
          </div>
        </div>
      </section>

      <Section icon={<VisualsIcon />} title="Visual Ideas">
        <ul className="space-y-2">
            {plan.visualIdeas.map((idea, index) => <ListItem key={index}>{idea}</ListItem>)}
        </ul>
      </Section>
      
      <Section icon={<EditingIcon />} title="Editing Tips">
        <ul className="space-y-2">
            {plan.editingTips.map((tip, index) => <ListItem key={index}>{tip}</ListItem>)}
        </ul>
      </section>

      <Section icon={<CtaIcon />} title="Call to Action">
        <p className="text-base sm:text-lg font-semibold text-center rounded-lg py-3 px-4 text-white bg-[#D3A6A0]">
          {plan.cta}
        </p>
      </section>
    </div>
  );
};
