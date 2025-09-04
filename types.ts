

// A single piece of content's structure
interface BaseContentPlan {
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