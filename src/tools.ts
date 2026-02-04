/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() })
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  }
});

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

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

      return JSON.stringify(sessionRequest, null, 2);
    } catch (error) {
      console.error("Error generating session plan", error);
      return `Error generating session plan: ${error}`;
    }
  }
})

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,
  setClimberProfile,
  generateSessionPlan
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};