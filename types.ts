// A single piece of content's structure
export interface BaseContentPlan {
  ideaTitle: string;
  hook: string;
  script: {
    hook: string;
    conflict: string;
    resolution: string;
  };
  visualIdeas: string[];
  editingTips: string[];
  cta: string;
}

// The response for the initial single plan generation
export interface ContentPlan extends BaseContentPlan {
  realBusinessJustification: string;
}

// The structure for one day within the 30-day calendar
export interface DayPlan extends BaseContentPlan {
  day: number;
}

// The response for the 30-day plan generation
export interface ThirtyDayPlan {
  realBusinessJustification: string;
  plan: DayPlan[];
}

// A list of text-based ideas (e.g., hooks, titles, overlay text)
export interface OverlayText {
  title: string;
  justification: string;
  texts: string[];
}

// Union type for any kind of generated REEL content
export type GeneratedReelContent =
  | { contentType: 'SINGLE_PLAN'; plan: ContentPlan }
  | { contentType: 'THIRTY_DAY_PLAN'; plan: ThirtyDayPlan }
  | { contentType: 'OVERLAY_TEXT'; plan: OverlayText };


// Types for the Ad Planner
export interface AdCopy {
    headline: string;
    primaryText: string;
    description: string;
    cta: string;
}

export interface AdCreativeBrief {
    hook: string;
    script: {
        hook: string;
        conflict: string;
        resolution: string;
    };
    visualIdeas: string[];
    editingTips: string[];
}

export interface Ad {
    week: number;
    valueProposition: string;
    adCopy: AdCopy;
    creativeBrief: AdCreativeBrief;
}

export interface Targeting {
    location: string;
    demographics: string;
    interests: string[];
    lookalikeAudienceSuggestion: string;
}

export interface Budget {
    monthly: number;
    daily: number;
    justification: string;
}

export interface AdPlan {
    strategicGoal: string;
    targetAudienceProfile: string;
    coreOffer: string;
    monthlyPlan: Ad[];
    budget: Budget;
    targeting: Targeting;
}

export type GeneratedAdContent = { contentType: 'AD_PLAN', plan: AdPlan };

export interface AdInputs {
  business: string;
  customer: string;
  painPoint: string;
  offer: string;
  goal: string;
}

// Union type for ANY generated content
export type GeneratedContent = GeneratedReelContent | GeneratedAdContent;

// Defines how the creator will appear in the video
export type Appearance = 'in-front' | 'background' | 'in-front-voiceover' | 'background-voiceover' | 'b-roll-voiceover';

// A single item in the generation history
export interface HistoryItem {
  prompt: string; // Used for Reel Planner prompt OR Ad Planner display title
  adInputs?: AdInputs; // Used to store structured ad inputs
  niche: string;
  appearance: Appearance;
  videoLength?: string;
  result: GeneratedContent;
  timestamp: number;
}