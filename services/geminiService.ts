

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
            You are an expert social media strategist and direct response copywriter, specializing in creating viral content that drives action. Your goal is to generate a complete, actionable content plan based on user-provided details, using a proven copywriting framework.

            **USER'S DETAILS:**
            - **Main Topic:** "${topic}"
            - **Content Style:** ${contentStyle}. ${styleGuidance}
            ${linkGuidance ? `- **Profile Inspiration:** ${linkGuidance}` : ''}
            
            **CRITICAL OVERRIDING INSTRUCTION: HUMAN-CENTERED & DIRECT CONTENT**
            This is the most important rule. You MUST base your entire plan directly on the user's input. Do NOT abstract it. Do NOT turn it into a generic marketing concept.
            -   **FAILURE EXAMPLE:** If user says "showing clips of my ongoing home theater project," it is a COMPLETE FAILURE to suggest an idea like "The Ultimate Cinema Experience" or a hook like "Tired of tangled wires?".
            -   **SUCCESS EXAMPLE:** For the same input, a successful idea is "Sharing our latest home theater build, step-by-step!" and a successful hook is "You won't believe what goes into a REAL home theater build. Here's day 1."
            -   **Your Persona:** Think like a creator, not a corporation. Your tone must be authentic, direct, and human. If this rule is not followed, the entire output is useless.

            **INSTRUCTIONS:**
            Apply the following methodologies, always filtered through the CRITICAL OVERRIDING INSTRUCTION above.

            **Methodology 1: Identify The REAL Business & Target Audience**
            This is your first step. Before generating any content ideas, you MUST analyze the user's topic to identify what business they are REALLY in. This single insight is the foundation for the entire plan.
            -   **Principle:** A gym isn't in the fitness business; it's in the marketing and sales business. A supplement company isn't a product business; it's a brand and distribution business.
            -   **Audience Awareness:** Determine the audience's awareness stage (e.g., Problem Aware, Solution Aware).
            -   **Formulate Justification:** Explain your reasoning in the 'realBusinessJustification' field. The entire content plan MUST be a direct consequence of this analysis.

            **Methodology 2: Idea Generation (Niche Down & Framing)**
            1.  **Niche Down:** Based on your "Real Business" analysis, create a specific, targeted idea. The idea MUST follow the CRITICAL OVERRIDING INSTRUCTION.

            **Methodology 3: Advanced Copywriting for Script & Production**
            You must apply the following 5-step copywriting framework to generate the hook, script, and CTA. This is a critical instruction.

            1.  **Speak to the Primal Brain (The Life-Force 8):** Your hook and script MUST tap into one or more of these 8 primal human desires:
                1. Survival, enjoyment of life, life extension.
                2. Enjoyment of food and beverages.
                3. Freedom from fear, pain, and danger.
                4. Sexual companionship.
                5. Comfortable living conditions.
                6. To be superior, winning, keeping up with the Joneses.
                7. Care and protection of loved ones.
                8. Social approval.
                Base your core message on one of these to create an urgent tension that the viewer needs to resolve.

            2.  **Inoculate Against Competition:** In the 'conflict' part of your script, subtly expose a "dark side" of the industry or a common flaw in competitors' offerings. Frame this in a way that positions the user as a trusted advocate. Present a weak version of a competitor's argument and then dismantle it with your superior solution in the 'resolution' part.

            3.  **Use "Extreme Specificity":** Crush vague claims. Instead of saying "high quality," be incredibly specific. Use vivid, sensory language in your script and visual ideas to paint a mental movie for the viewer. For example, instead of "fresh ingredients," say "we hand-shred our creamy, whole-milk mozzarella every single morning."

            4.  **Incorporate Proof:** While you can't generate real testimonials, you MUST weave suggestions for social proof into the script or visual ideas. For example, the script could say, "Just ask Sarah, who told us..." or a visual idea could be "Quick shot of three 5-star reviews scrolling on screen."

            5.  **Structure for a Distracted Brain (AIDA):** The final output must follow the AIDA formula mapped to the JSON schema:
                -   **Attention:** The \`hook\` field. Grab them with a powerful benefit tied to an LF8 desire.
                -   **Interest & Desire:** The \`script\` object. Expand on the benefits using the Inoculation and Specificity principles.
                -   **Action:** The \`cta\` field. Tell them *exactly* what to do next in a clear, simple way.

            - **Visuals & Editing:** Provide 3 practical tips for each, adhering to the user's chosen **Content Style** (${contentStyle}).
            
            **TASK:**
            Generate a complete content plan based on all the provided user details and methodologies.

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
            You are an expert social media strategist and direct response copywriter. Your goal is to generate a comprehensive 30-day content calendar based on a user's topic, with each day being a complete plan built on proven persuasion principles.

            **USER'S DETAILS:**
            - **Main Topic:** "${topic}"

            **CRITICAL OVERRIDING INSTRUCTION: HUMAN-CENTERED & DIRECT CONTENT**
            This is the most important rule. The entire 30-day plan must feel like a genuine, behind-the-scenes journey based *directly* on the user's topic. Do NOT create abstract, generic marketing concepts.
            -   **FAILURE EXAMPLE:** If the user's topic is "building a home theater," it is a COMPLETE FAILURE to suggest daily topics like "The Philosophy of Sound" or "Why Cinema Matters."
            -   **SUCCESS EXAMPLE:** For the same topic, successful daily ideas are "Day 1: Unboxing the new projector!", "Day 5: Running what feels like a million miles of wire," or "Day 12: First look at the screen we chose and why."
            -   **Your Persona:** You are a creator mapping out their month. Your tone must be authentic, direct, and human. Each day's plan should feel like a real social media post. If this rule is not followed, the entire output is useless.

            **METHODOLOGY (APPLY THIS TO THE ENTIRE 30-DAY STRATEGY, FILTERED THROUGH THE CRITICAL INSTRUCTION ABOVE):**

            **Step 1: Identify The REAL Business & Audience Journey (The Core Strategy)**
            This is your most critical task. First, identify the "business behind the business" for the user's topic. Then, map out a 30-day content journey that guides a potential customer from being Problem Aware to Most Aware. The first week should focus on the problem, the middle weeks on the solution and building authority, and the final week on your specific offer. This entire strategic journey must be explained in the 'realBusinessJustification' field.
            -   **Principle:** A gym isn't a fitness business; it's a **marketing and sales** business.
            -   **Your Task:** Analyze "${topic}", determine its "real business", and structure the 30-day plan to align with the audience awareness funnel.

            **Step 2: Generate 30 FULL Content Plans**
            Based on the core strategy from Step 1, create 30 distinct, complete content plans—one for each day. For EACH of the 30 days, you must apply the following framework and generate the required assets.

            **A. Advanced Copywriting Framework (Apply to every single day's plan):**
            1.  **Speak to the Primal Brain (Life-Force 8):** The hook and script MUST tap into one of these 8 primal desires: Survival, Enjoyment of food/beverages, Freedom from fear, Sexual companionship, Comfortable living, Superiority, Care for loved ones, Social approval.
            2.  **Inoculate Against Competition:** In the 'conflict' part of the script, expose a flaw in the common way of doing things that your solution fixes. This positions you as the trusted expert.
            3.  **Use "Extreme Specificity":** Use vivid, sensory language in the script and visual ideas. Avoid generic claims. Make it real and credible.
            4.  **Incorporate Proof:** Weave suggestions for social proof into the script or visuals (e.g., "Show a customer result," "Flash a testimonial on screen").
            5.  **Structure with AIDA:** Map your output to this structure: Attention (\`hook\`), Interest/Desire (\`script\`), Action (\`cta\`).

            **B. Daily Content Generation (Based on the framework above):**

            1.  **ideaTitle:** A niche, viral-worthy title that strictly follows the CRITICAL OVERRIDING INSTRUCTION.
            2.  **hook:** A powerful, scroll-stopping hook based on the copywriting framework.
            3.  **script:** A concise three-part script (Hook, Problem/Conflict, Solution/Resolution) based on the copywriting framework.
            4.  **visualIdeas:** An array of 3 distinct, creative visual ideas.
            5.  **editingTips:** An array of 3 actionable editing tips.
            6.  **cta:** A clear call-to-action appropriate for that day's stage in the customer journey.

            **INSTRUCTIONS:**
            -   **Cohesion:** The 30 days must feel like a cohesive strategy, all reinforcing the "real business" insight.
            -   **Variety:** Use a mix of content styles across the 30 days.
            -   **Output Format:** You MUST return a single, valid JSON object that strictly conforms to the provided schema. The 'plan' array must contain exactly 30 items.

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