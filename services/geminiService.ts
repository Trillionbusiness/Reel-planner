import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { GeneratedReelContent, GeneratedAdContent, AdPlan, Appearance } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas for Reel Planner ---
const baseContentPlanSchemaProperties = {
    ideaTitle: { type: Type.STRING, description: "A concise, engaging title for the content idea." },
    hook: { type: Type.STRING, description: "A powerful, scroll-stopping hook (1-2 sentences)." },
    script: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING, description: "The hook part of the script." },
        conflict: { type: Type.STRING, description: "The conflict or problem part of the script." },
        resolution: { type: Type.STRING, description: "The resolution or solution part of the script. This section MUST contain the actual, complete information promised in the hook." },
      },
      required: ["hook", "conflict", "resolution"],
    },
    visualIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 distinct, 'cinematic' visual ideas. For each idea, provide a brief but specific description of the shot, including camera angle, lighting, or movement to create a high-quality feel (e.g., 'Slow-motion close-up of hands kneading dough, with flour dusting the air, backlit by morning sun.')." },
    editingTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 actionable editing tips." },
    cta: { type: Type.STRING, description: "A clear call-to-action." },
};

const singlePlanSchema = {
  type: Type.OBJECT,
  properties: {
    realBusinessJustification: { type: Type.STRING, description: "A strategic analysis of the user's 'real business' based on the provided topic. This justification explains the core problem being solved and is the foundation for the entire content strategy." },
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
        realBusinessJustification: { type: Type.STRING, description: "A strategic analysis of the user's 'real business' that serves as the foundation for the entire 30-day calendar." },
        plan: { type: Type.ARRAY, description: "An array of 30 detailed content plans, one for each day.", items: dayPlanSchema }
    },
    required: ["realBusinessJustification", "plan"],
};

const overlayTextSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A title for the list of text ideas, e.g., '5 Viral Hooks for Your Topic'." },
        justification: { type: Type.STRING, description: "A brief explanation of the strategy behind these text ideas." },
        texts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 5-10 short, impactful text snippets (e.g., hooks, titles, overlay text)." }
    },
    required: ["title", "justification", "texts"],
};

const reelPlannerMasterSchema = {
    type: Type.OBJECT,
    properties: {
        contentType: {
            type: Type.STRING,
            enum: ["SINGLE_PLAN", "THIRTY_DAY_PLAN", "OVERLAY_TEXT"],
            description: "The type of content generated based on the user's request."
        },
        plan: {
            type: Type.OBJECT,
            description: "The payload containing the generated content. The structure of this object depends on the contentType.",
            properties: {
                singlePlan: singlePlanSchema,
                thirtyDayPlan: thirtyDayPlanSchema,
                overlayText: overlayTextSchema,
            }
        }
    },
    required: ["contentType", "plan"]
};

// --- Schemas for Ad Planner ---
const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING, description: "A powerful, scroll-stopping headline that calls out the audience." },
        primaryText: { type: Type.STRING, description: "Compelling copy that uses proof, specificity, and addresses the audience's problems." },
        description: { type: Type.STRING, description: "A short, punchy description for placements that support it." },
        cta: { type: Type.STRING, description: "A clear, direct call to action (e.g., 'Book Your Free Audit')." },
    },
    required: ["headline", "primaryText", "description", "cta"],
};

const adCreativeBriefSchema = {
    type: Type.OBJECT,
    description: "A detailed brief for a short-form video ad creative.",
    properties: {
        hook: { type: Type.STRING, description: "The visual and audio hook for the first 3 seconds of the video." },
        script: {
            type: Type.OBJECT,
            properties: {
                hook: { type: Type.STRING, description: "The hook part of the script's voiceover or dialogue." },
                conflict: { type: Type.STRING, description: "The conflict or problem presented in the script." },
                resolution: { type: Type.STRING, description: "The resolution or solution presented in the script." },
            },
            required: ["hook", "conflict", "resolution"],
        },
        visualIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 distinct, 'cinematic' visual ideas for the ad. For each idea, provide a brief but specific description of the shot, including camera angle, lighting, or movement to create a high-quality feel (e.g., 'Slow-motion shot of product being unboxed, with dramatic side-lighting highlighting textures.')." },
        editingTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 actionable editing tips to increase engagement." },
    },
    required: ["hook", "script", "visualIdeas", "editingTips"],
};

const adSchema = {
    type: Type.OBJECT,
    properties: {
        week: { type: Type.INTEGER, description: "The week number of the campaign (1-4)." },
        valueProposition: { type: Type.STRING, description: "The core message and strategic focus for this week's ad." },
        adCopy: adCopySchema,
        creativeBrief: adCreativeBriefSchema,
    },
    required: ["week", "valueProposition", "adCopy", "creativeBrief"],
};

const targetingSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING, description: "Specific geographic targeting (e.g., 'Austin, TX', 'United States')." },
        demographics: { type: Type.STRING, description: "A specific age range and any other relevant demographics." },
        interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 5-10 specific interest targeting options for platforms like Meta." },
        lookalikeAudienceSuggestion: { type: Type.STRING, description: "A strong recommendation to create a 1% lookalike audience from an existing customer list." },
    },
    required: ["location", "demographics", "interests", "lookalikeAudienceSuggestion"],
};

const budgetSchema = {
    type: Type.OBJECT,
    properties: {
        monthly: { type: Type.NUMBER, description: "The total recommended monthly ad spend." },
        daily: { type: Type.NUMBER, description: "The recommended daily ad spend." },
        justification: { type: Type.STRING, description: "Justification for the budget based on testing principles or market standards." },
    },
    required: ["monthly", "daily", "justification"],
};

const adPlanSchema = {
    type: Type.OBJECT,
    properties: {
        strategicGoal: { type: Type.STRING, description: "The primary objective of the campaign (e.g., 'Book a free roof inspection')." },
        targetAudienceProfile: { type: Type.STRING, description: "A detailed profile of the ideal customer, including their pain points and core desires." },
        coreOffer: { type: Type.STRING, description: "The irresistible offer. If the price isn't disclosed in the ad (e.g., high-ticket), this should say something like 'Book a Call for a Custom Quote'." },
        monthlyPlan: { type: Type.ARRAY, items: adSchema, description: "A sequence of 4 distinct ads, one for each week." },
        budget: budgetSchema,
        targeting: targetingSchema,
    },
    required: ["strategicGoal", "targetAudienceProfile", "coreOffer", "monthlyPlan", "budget", "targeting"],
};

const fullAdPlanSchema = {
    type: Type.OBJECT,
    properties: {
        contentType: { type: Type.STRING, enum: ["AD_PLAN"] },
        plan: adPlanSchema,
    },
    required: ["contentType", "plan"],
};


// --- Main Generation Functions ---
export async function* generateReelContentStream(prompt: string, niche: string, appearance: Appearance, videoLength: string): AsyncGenerator<string> {
    const fullPrompt = `
        You are an expert-level, versatile social media strategist and direct-response copywriter. Your primary function is to understand a user's natural language request and generate one of three possible content types: a full single reel plan, a 30-day content calendar, or a list of short text ideas (like hooks or overlay text).

        **USER'S REQUEST DETAILS:**
        - **Core Topic:** "${prompt}"
        - **Niche:** ${niche || 'Not specified'}
        - **Creator's Planned Appearance:** "${appearance}". This is a critical instruction. The visual ideas and script MUST reflect this choice. 
            - 'in-front': The creator is speaking directly to the camera. The script should be written as dialogue for the creator.
            - 'in-front-voiceover': The creator is speaking to the camera, but with a voiceover track. The script should account for both what is said on camera and the voiceover narration.
            - 'background': The creator is on-screen performing an action (e.g., cooking, workout, product demo) without speaking. The script should focus on visual cues and on-screen text.
            - 'background-voiceover': The creator is on-screen performing an action, with a voiceover narrating events. The script must be written as a voiceover.
            - 'b-roll-voiceover': The creator is NOT on screen. The video consists of B-roll footage (supplemental shots, scenery, product shots, etc.) with a voiceover narrating. The script must be written as a voiceover, and visual ideas should suggest appropriate B-roll shots.
        - **Desired Video Length:** "${videoLength || 'Not specified'}". This is another critical instruction. The script's length, the complexity of visual ideas, and editing tips MUST be tailored to fit this duration. For shorter videos (e.g., under 30s), the script must be concise and visuals simple. For longer videos (e.g., 60-90s), the script can be more detailed. If not specified, assume a standard 30-60 second length.


        **STEP 1: ANALYZE USER INTENT**
        First, analyze the user's Core Topic to determine which of the three content types they want.
        - If they ask for a "plan," "reel idea," "video idea," or describe a single piece of content, their intent is \`SINGLE_PLAN\`.
        - If they ask for a "30-day plan," "calendar," "monthly plan," or a series of ideas over time, their intent is \`THIRTY_DAY_PLAN\`.
        - If they ask for "hooks," "titles," "overlay text," "text ideas," or a short list of text snippets, their intent is \`OVERLAY_TEXT\`.
        You MUST correctly identify the intent and set the \`contentType\` field in the final JSON output.

        **STEP 2: APPLY CORE METHODOLOGIES (FOR PLANS)**
        If the intent is \`SINGLE_PLAN\` or \`THIRTY_DAY_PLAN\`, you MUST apply the following proven copywriting and strategy frameworks.

        **CRITICAL CONTENT QUALITY INSTRUCTION: DELIVER REAL VALUE**
        Your primary directive is to provide complete, actionable, and truthful information.
        - **Fulfill All Promises:** If the hook or script promises a list, a number of tips, steps, or a specific piece of information (e.g., "3 ways to...", "The #1 mistake is..."), you MUST provide the complete, detailed information within the script. Do not just create a template; provide the actual content in the 'resolution' section.
        - **BE THE EXPERT:** The user is coming to you for real help. The content you generate must be concrete, specific, and genuinely useful. For example, if the topic is metabolism, provide actual, study-based tips like "Start with a glass of cold water," "Incorporate protein into your breakfast," and "Try a few minutes of light activity."
        - **Ethical & Factual:** Ensure the information is safe, ethical, and based on widely accepted knowledge. Avoid making unsubstantiated medical or financial claims. Your goal is to be a helpful and trustworthy expert.

        **CRITICAL OVERRIDING INSTRUCTION: HUMAN-CENTERED & DIRECT CONTENT**
        This is your most important rule. Your output MUST be based directly on the user's input. Do NOT abstract it or turn it into a generic marketing concept.
        -   **FAILURE EXAMPLE:** If user says "clips of my home theater project," it is a COMPLETE FAILURE to suggest "The Ultimate Cinema Experience."
        -   **SUCCESS EXAMPLE:** A successful idea is "Sharing our home theater build, step-by-step!"
        -   **Your Persona:** You are a creator, not a corporation. Your tone is authentic, direct, and human.

        **FRAMEWORKS TO APPLY:**
        1.  **Identify The REAL Business:** Analyze the user's topic to find the business they are REALLY in. A gym isn't in fitness; it's in marketing and sales. This insight is the foundation. Explain it in the 'realBusinessJustification' or 'justification' field.
        2.  **Use "Extreme Specificity":** Crush vague claims. Instead of "high quality," say "we hand-shred our creamy, whole-milk mozzarella every morning." Paint a mental movie.
        3.  **Inoculate Against Competition:** Subtly expose a "dark side" of the industry or a common flaw in competitors' offerings that your solution fixes.
        4.  **Incorporate Proof:** Weave suggestions for social proof into the script or visual ideas (e.g., "Show a 5-star review on screen").
        5.  **Structure for a Distracted Brain (AIDA):**
            -   Attention: The \`hook\`.
            -   Interest & Desire: The \`script\` or main content.
            -   Action: The \`cta\`.

        **STEP 3: GENERATE THE CONTENT BASED ON INTENT**

        -   **If \`SINGLE_PLAN\`:** Generate a complete, actionable content plan. The output JSON MUST contain \`contentType: "SINGLE_PLAN"\` and the \`plan\` object must contain the \`singlePlan\` field.
        -   **If \`THIRTY_DAY_PLAN\`:** First, define the core strategy. Then, generate 30 distinct, complete daily content plans. The output JSON MUST contain \`contentType: "THIRTY_DAY_PLAN"\` and the \`plan\` object must contain the \`thirtyDayPlan\` field. It MUST have exactly 30 days.
        -   **If \`OVERLAY_TEXT\`:** Generate a list of 5-10 powerful text snippets. The output JSON MUST contain \`contentType: "OVERLAY_TEXT"\` and the \`plan\` object must contain the \`overlayText\` field.

        **FINAL INSTRUCTION:**
        You MUST return a single, valid JSON object that conforms to the master schema provided. Your response should contain the \`contentType\` field and a \`plan\` object, where ONLY the field corresponding to the identified intent is populated. Do not include any text or markdown before or after the JSON.
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reelPlannerMasterSchema,
                temperature: 0.8,
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating reel content:", error);
        throw new Error("Failed to generate reel content. The model may have returned an invalid response.");
    }
};

export async function* generateAdPlanStream(prompt: string, niche: string, appearance: Appearance): AsyncGenerator<string> {
    const fullPrompt = `
        You are an expert-level paid advertising strategist, modeled after Alex Hormozi. Your function is to generate a comprehensive, actionable 1-month paid advertising plan based on a user's business description.

        **USER'S BUSINESS DETAILS:**
        - **Business Description:** "${prompt}"
        - **Niche:** ${niche || 'Not specified'}
        - **Creator's Planned Appearance for Video Ads:** "${appearance}". This is a critical instruction for the 'Creative Brief' section. The visual ideas and script for each ad's video creative MUST reflect this choice.
            - 'in-front': The creator is speaking directly to the camera. The script should be written as dialogue for the creator.
            - 'in-front-voiceover': The creator is speaking to the camera, but with a voiceover track. The script should account for both what is said on camera and the voiceover narration.
            - 'background': The creator is on-screen performing an action (e.g., cooking, workout, product demo) without speaking. The script should focus on visual cues and on-screen text.
            - 'background-voiceover': The creator is on-screen performing an action, with a voiceover narrating events. The script must be written as a voiceover.
            - 'b-roll-voiceover': The creator is NOT on screen. The video consists of B-roll footage (e.g., product shots, scenery, stock footage) with a voiceover narrating. The script must be written as a voiceover, and visual ideas should suggest appropriate B-roll shots.

        **METHODOLOGY:**
        You MUST base your entire strategy on the principles from "$100M Leads" and Hormozi's direct-response methodologies. Your primary goal is to create a plan that generates leads and is designed for "Client Financed Acquisition."

        **STEP 1: STRATEGIC ANALYSIS**
        - **Target Audience Profile**: Define the ideal customer. Who are they? What are their biggest pain points and core desires?
        - **Strategic Goal**: Define the primary, measurable objective of the campaign (e.g., "Book a free roof inspection," "Sell a $29 acupuncture consultation").
        - **Core Offer**: Define the irresistible offer. If the price isn't meant to be disclosed in the ad (e.g., for high-ticket items or consultation funnels), describe the offer without a specific price, using phrases like 'Custom Quote' or 'Book a Call for Pricing'.

        **STEP 2: TARGETING & BUDGET**
        - **Targeting**: Provide specific Location, Demographics, and 5-10 powerful interest targeting options for Meta. Strongly recommend creating a 1% lookalike audience.
        - **Budget**: Provide specific monthly and daily dollar amounts, justified by testing principles.

        **STEP 3: 4-WEEK AD CAMPAIGN**
        Generate a sequence of 4 distinct ads, one for each week.
        For each ad:
        - **Value Proposition**: The core message for the week.
        - **Ad Copy**: Generate a powerful Headline, Primary Text, Description, and CTA. The copy MUST follow these rules:
            - **Call out one specific person** and their direct pain point (e.g., "Hey busy mama...").
            - **Describe their moments of suffering** to build empathy (e.g., "You pull up to the parking lot, stare at the crowd, and drive away.").
            - **Build trust by admitting a small flaw**, then stating a major strength (e.g., "My playlist is 90% old-school, but I've coached 10,000+ hours.").
            - **Incorporate social proof and authority** (e.g., "certified in pre/post-natal", "10+ years experience").
            - **Describe the status they will gain** from your service (e.g., "...and your cousin whispering, 'Damn, how?'").
            - **Use urgency and scarcity** to drive action (e.g., "I only take 4 clients per month.").
            - **Write at a 3rd-grade reading level** for maximum clarity, but with adult understanding.
        - **Creative Brief**: This is CRITICAL. Generate a complete, actionable plan for a short-form video ad. It MUST include:
          - A powerful visual and audio **hook**.
          - A full **script** with 'hook,' 'conflict,' and 'resolution' sections.
          - 3 cinematic **visual ideas**.
          - 3 actionable **editing tips**.

        **FINAL INSTRUCTION:**
        You MUST return a single, valid JSON object that conforms to the AdPlan schema provided. The contentType must be "AD_PLAN". Do not include any text or markdown before or after the JSON.
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: fullAdPlanSchema,
                temperature: 0.7,
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating ad plan:", error);
        throw new Error("Failed to generate ad plan. The model may have returned an invalid response.");
    }
}

export const parseAndTransformContent = (jsonString: string): GeneratedReelContent | GeneratedAdContent => {
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
        throw new Error("Could not find a valid JSON object in the model's response.");
    }
    const cleanedJsonString = jsonString.substring(jsonStart, jsonEnd + 1);

    try {
        const rawObject = JSON.parse(cleanedJsonString);
        if (!rawObject.contentType || !rawObject.plan) {
            throw new Error("Invalid response structure from model.");
        }
        const { contentType, plan } = rawObject;

        switch (contentType) {
            case 'SINGLE_PLAN':
                if (!plan.singlePlan && !plan) throw new Error("Missing singlePlan data.");
                return { contentType: 'SINGLE_PLAN', plan: plan.singlePlan || plan };
            case 'THIRTY_DAY_PLAN':
                if (!plan.thirtyDayPlan && !plan) throw new Error("Missing thirtyDayPlan data.");
                return { contentType: 'THIRTY_DAY_PLAN', plan: plan.thirtyDayPlan || plan };
            case 'OVERLAY_TEXT':
                if (!plan.overlayText && !plan) throw new Error("Missing overlayText data.");
                return { contentType: 'OVERLAY_TEXT', plan: plan.overlayText || plan };
            case 'AD_PLAN':
                 if (!plan) throw new Error("Missing adPlan data.");
                return { contentType: 'AD_PLAN', plan: plan as AdPlan };
            default:
                throw new Error(`Unknown content type: ${contentType}`);
        }
    } catch(e) {
        console.error("Failed to parse cleaned JSON:", cleanedJsonString);
        throw new Error("Failed to parse JSON from the model's response.");
    }
};