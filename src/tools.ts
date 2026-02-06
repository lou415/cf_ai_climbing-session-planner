import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";

const setClimberProfile = tool({
  description: "Save climber's profile including climbing grade, weaknesses, and goals for personalized traning plan",
  inputSchema: z.object({
    boulderingGrade: z.string().optional().describe("Climber's current climbing grade. ie) V4,V5,etc."),
    sportGrade: z.string().optional().describe("Climber's current sport climbing grade. ie) 5.10a, 5.13d, 5.15d."),
    weaknesses: z.array(z.string()).optional().describe("techniques to improve: crimps, slopers, pinches, pockets, heelhooks, body tension, weight shifting, dynamic movement, body positioning"),
    injuries: z.string().optional().describe("Any current injuries or limitation to work around."),
    goal: z.string().optional().describe("What the climber is working towards.")
  }),
  execute: async({boulderingGrade, sportGrade, weaknesses, injuries, goal}) =>{
    const { agent } = getCurrentAgent<Chat>();

    try{
      const profile = {
        boulderingGrade,
        sportGrade,
        weaknesses,
        injuries,
        goal,
        updatedAt: new Date().toISOString()
      };
      
      agent!.setState({ ...(agent!.state || {}), climberProfile: profile });
      return `Profile saved! Bouldering: ${boulderingGrade || "not set"}, Sport: ${sportGrade || "not set"}, Weaknesses: ${weaknesses?.join(", ") || "none specified"}, Goals: ${goal || "not set"}`;
    } catch (error){
      console.error("Error saving climber profile", error);
      return `Error saving profile: ${error}`;
    }
  }

});

const generateSessionPlan = tool({
  description: "Generate a structured climbing training session based on the saved profile of the climber and session-specific inputs. Use stored profile for their grades and weaknesses.",
  inputSchema: z.object({
    duration: z.number().describe("Session length in minutes."),
    focus: z.array(z.string()).describe("What to focus on in the session: crimps, slopers, pinches, pockets, heelhooks, body tension, weight shifting, dynamic movement, body positioning, endurance, or power"),
    setting: z.enum(["indoor", "outdoor"]).describe("Training environment"),
    discipline: z.enum(["Bouldering", "Sport"]).describe("Bouldering or sport climbing")
  }),
  execute: async ({ duration, focus, setting, discipline}) => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const profile = (agent!.state as any)?.climberProfile;

      const sessionRequest = {
        duration,
        focus,
        setting,
        discipline,
        climberProfile: profile || "No profile saved - using general recommendations"
      };

      return `Generate a detailed climbing session plan based on this data: ${JSON.stringify(sessionRequest)}. 
      Include specific warm-up activities, drills for the focus areas, main session structure with rest periods, and cool-down. Format it clearly with sections.`;
    } catch (error) {
      console.error("Error generating session plan", error);
      return `Error generating session plan: ${error}`;
    }
  }
})

export const tools = {
  setClimberProfile,
  generateSessionPlan
} satisfies ToolSet;