
import { GoogleGenAI, Type } from "@google/genai";
import type { ThirtyDayPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const baseContentPlanSchemaProperties = {
    ideaTitle: {
      type: Type.STRING,
      description: "A concise, engaging title for the content idea."
    },
    hook: {
      type: Type.STRING,
      description: "A powerful, scroll-stopping hook (1-2 sentences)."
    },
    script: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING, description: "The hook part of the script." },
        conflict: { type: Type.STRING, description: "The conflict or problem part of the script." },
        resolution: { type: Type.STRING, description: "The resolution or solution part of the script." },
      },
      required: ["hook", "conflict", "resolution"],
    },
    visualIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3 distinct, creative visual ideas for filming."
    },
    editingTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3 actionable editing tips."
    },
    cta: {
      type: Type.STRING,
      description: "A clear call-to-action for the end of the video."
    },
};

const singlePlanSchema = {
  type: Type.OBJECT,
  properties: {
    realBusinessJustification: {
        type: Type.STRING,
        description: "A strategic analysis of the user's 'real business' based on the provided topic. This justification explains the core problem being solved and is the foundation for the entire content strategy."
    },
    ...baseContentPlanSchemaProperties,
  },
  required: ["realBusinessJustification", "ideaTitle", "hook", "script", "visualIdeas", "editingTips", "cta"],
};

const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.INTEGER, description: "The day number, from 1 to 30." },
        ...baseContentPlanSchemaProperties,
    },
    required: ["day", "ideaTitle", "hook", "script", "visualIdeas", "editingTips", "cta"],
};

const thirtyDayPlanSchema = {
    type: Type.OBJECT,
    properties: {
        realBusinessJustification: {
          type: Type.STRING,
          description: "A strategic analysis of the user's 'real business' that serves as the foundation for the entire 30-day calendar."
        },
        plan: {
            type: Type.ARRAY,
            description: "An array of 30 detailed content plans, one for each day.",
            items: dayPlanSchema
        }
    },
    required: ["realBusinessJustification", "plan"],
};


export async function* generateContentPlanStream(
    topic: string,
    socialMediaLink: string,
    contentStyle: 'with-face' | 'faceless'
): AsyncGenerator<string> {
    try {
        const styleGuidance = contentStyle === 'faceless'
            ? "Visual ideas must NOT show a person's face. Focus on B-roll, product shots, screen recordings, text on screen, or shots from the hands/shoulders down (point-of-view)."
            : "Visual ideas should include a person talking to the camera, demonstrating something, or acting out a scenario.";
        
        const linkGuidance = socialMediaLink
            ? `To better match the user's personal brand, consider the style of content that might be found at a profile like this: ${socialMediaLink}. This is for tonal and stylistic inspiration only.`
            : "";

        const prompt = `
            You are an expert social media strategist and business consultant specializing in creating viral content for platforms like Instagram Reels and TikTok. Your goal is to generate a complete, actionable content plan based on user-provided details.

            **USER'S DETAILS:**
            - **Main Topic:** "${topic}"
            - **Content Style:** ${contentStyle}. ${styleGuidance}
            ${linkGuidance ? `- **Profile Inspiration:** ${linkGuidance}` : ''}

            **INSTRUCTIONS:**
            Your primary and most critical task is to apply the following methodology to generate the content plan.

            **Methodology 1: Identify The REAL Business (Core Principle Analysis)**
            This is your first step. Before generating any content ideas, you MUST analyze the user's topic and identify what business they are REALLY in. This single insight is the foundation for the entire plan. You will output your analysis in the 'realBusinessJustification' field.

            **Principles to follow:**
            1.  **Look Beyond the Obvious:** The stated business is rarely the real business. Most entrepreneurs are stuck because they're working on the wrong stuff. The biggest opportunity is the one right in front of them.
                -   *Example 1:* A gym isn't in the fitness business; it's in the **marketing and sales** business.
                -   *Example 2:* A supplement company isn't in the product business; it's in the **brand, media, and distribution** business.
                -   *Example 3:* A cleaning service isn't in the cleaning business; it's in the **recruiting and training** business.
                -   *Example 4:* A software company might not be in marketing; it might be in the **product** business (if the product sells itself).
            2.  **Identify the Constraint:** What is the "big hairy problem" that truly determines success in this industry? What's keeping a business in this field from doubling its revenue?
            3.  **Formulate Justification:** Clearly explain your reasoning in the 'realBusinessJustification' field. State what business the user *thinks* they are in, and what business they are *really* in, and why that mindset shift is the key to growth.
            4.  **Focus the Plan:** The entire content plan you generate (idea, hook, script, etc.) MUST be a direct consequence of this strategic analysis. It must be designed to solve the *real* business problem you identified.

            **Methodology 2: Idea Generation (Niche Down & Framing)**
            1.  **Niche Down:** Based on your "Real Business" analysis, create a specific, targeted idea. Example: If the user's topic is "cleaning business," your analysis identifies the real business as 'recruiting and training'. A niched-down idea would be "How I went from $40k to $150k a month by realizing I was in the recruiting business, not the cleaning business."
            2.  **Framing:** Choose a powerful framing approach (e.g., How I, Lessons, Mistakes, Ways, Tools, Reasons).
            3.  **Credibility:** Use personal and authoritative language.

            **Methodology 3: Script & Production**
            - **Hook:** Generate a powerful hook based on your core insight.
            - **Script:** Write a concise three-part story (Hook, Problem, Resolution) that reflects the mindset shift.
            - **Visuals & Editing:** Provide 3 practical tips for each, adhering to the user's chosen **Content Style** (${contentStyle}).

            **TASK:**
            Generate a complete content plan based on all the provided user details, starting with the core principle analysis.

            **Output Format:**
            You MUST return a single, valid JSON object that conforms to the provided schema. Do not include any text or markdown before or after the JSON object.
        `;

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: singlePlanSchema,
                temperature: 0.8,
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating content plan:", error);
        throw new Error("Failed to generate content plan. The model may have generated an invalid response.");
    }
};

export async function generateThirtyDayPlan(topic: string): Promise<ThirtyDayPlan> {
     try {
        const prompt = `
            You are an expert social media strategist and business consultant. Your goal is to generate a comprehensive and actionable 30-day content calendar based on a user's topic. Each day must be a complete, detailed plan.

            **USER'S DETAILS:**
            - **Main Topic:** "${topic}"

            **METHODOLOGY (APPLY THIS TO THE ENTIRE 30-DAY STRATEGY):**

            **Step 1: Identify The REAL Business (The Core Strategy)**
            This is your most critical task. Before creating any content, you must identify the "business behind the business" for the user's topic. This single insight will be the foundation for the entire 30-day plan. You will state this in the 'realBusinessJustification' field.

            -   **Principle:** What got someone to a million won't get them to 30 million. The biggest opportunity is right in front of them, but they're often working on the wrong stuff because they're in a completely different business than they think.
            -   **Examples:**
                -   A gym isn't a fitness business; it's a **marketing and sales** business.
                -   A supplement company isn't a product business; it's a **brand, media, and distribution** business.
                -   A cleaning service is a **recruiting and training** business.
            -   **Your Task:** Analyze "${topic}" and determine its "real business". This core theme must be woven through the entire 30-day plan. All 30 content ideas should, in some way, address this core business challenge.

            **Step 2: Generate 30 FULL Content Plans**
            Based on the core strategy from Step 1, create 30 distinct, complete content plans—one for each day. For EACH of the 30 days, you must generate the following:
            1.  **ideaTitle:** A niche, viral-worthy title that relates to the core strategy.
            2.  **hook:** A powerful, scroll-stopping hook.
            3.  **script:** A concise three-part script (Hook, Problem/Conflict, Solution/Resolution).
            4.  **visualIdeas:** An array of 3 distinct, creative visual ideas for filming.
            5.  **editingTips:** An array of 3 actionable editing tips (e.g., captions, audio, cuts).
            6.  **cta:** A clear call-to-action.

            **INSTRUCTIONS:**
            -   **Cohesion:** The 30 days must feel like a cohesive strategy, all reinforcing the "real business" insight you identified.
            -   **Variety:** Use a mix of content styles (e.g., actionable tips, personal stories, trend analysis, myth-busting) across the 30 days to keep the calendar engaging.
            -   **Adaptability:** Provide ideas that are adaptable for both 'with-face' and 'faceless' styles.
            -   **Output Format:** You MUST return a single, valid JSON object that strictly conforms to the provided schema. The 'plan' array must contain exactly 30 items, and the top-level 'realBusinessJustification' field must be filled.

            **TASK:**
            Generate the complete 30-day content plan based on this methodology.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: thirtyDayPlanSchema,
                temperature: 0.7,
            }
        });

        const jsonString = response.text;
        const finalPlan = JSON.parse(jsonString);
        return finalPlan;

    } catch (error) {
        console.error("Error generating 30-day plan:", error);
        throw new Error("Failed to generate 30-day content plan.");
    }
}
