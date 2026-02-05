import { routeAgentRequest } from "agents";

import { AIChatAgent } from "@cloudflare/ai-chat";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { cleanupMessages } from "./utils";
import { tools } from "./tools";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    options?: { abortSignal?: AbortSignal }
  ) {
    const workersai = createWorkersAI({ binding: this.env.AI });
    const model = workersai("@cf/meta/llama-3.1-70b-instruct");

    const allTools = {
      ...tools,
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        const result = streamText({
          system: `You are an experienced rock climbing coach and session planner. You help climbers structure their training sessions for maximum improvement through incremental gains.

## Your Coaching Knowledge

### Session Structure
Every session should include:
- **Warm-up (15 min)**: Light cardio, dynamic stretching, lymphatic jumps, neural finger training (recruiting finger strength on fingerboard or climbing wall)
- **Skill/Technique Work (15-20 min)**: Focused drills on the session's target skills
- **Main Session (varies)**: Project-level climbing or structured exercises
- **Cool-down (10-15 min)**: Easy climbing, static stretching, antagonist exercises

### Training Focus Guidelines

**Strength (crimps, slopers, pinches, pockets)**:
- Use max hangs or repeaters on hangboard during warm-up
- Limit bouldering: 3-5 hard moves, full rest between attempts
- Keep total hard attempts under 20 to avoid injury

**Technique (heelhooks, body tension, weight shifting, dynamic movement, body positioning)**:
- Drill specific movements on easier terrain (2-3 grades below max)
- Use repetition: 5-10 reps of the same move or sequence
- Video review if possible

**Endurance**:
- 4x4s: Four boulder problems back-to-back, four sets, 4 min rest
- ARCing: 20-30 min continuous easy climbing for aerobic base
- Circuits: Link 6-10 problems with minimal rest

**Power**:
- Campus board work (only if experienced)
- Dynamic movement drills
- Limit bouldering with explosive moves

### Safety Considerations
- If injuries are noted, avoid exercises that stress those areas
- Always prioritize warm-up to prevent injury
- End session if form breaks down

## Tools Available
- Use setClimberProfile to save a user's grades, weaknesses, and goals
- Use generateSessionPlan to create a structured session - then USE THE OUTPUT to write a detailed, personalized plan

When you receive session plan data from the tool, transform it into a clear, actionable training plan with specific exercises, rep schemes, and rest periods.
`,

          messages: await convertToModelMessages(cleanedMessages),
          model,
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10),
          abortSignal: options?.abortSignal
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/check-open-ai-key") {
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
      return Response.json({
        success: hasOpenAIKey
      });
    }
    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production"
      );
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;

// ========== ORIGINAL STARTER CODE (commented out) ==========
//
// // OpenAI setup (replaced by Workers AI)
// // import { openai } from "@ai-sdk/openai";
// // import { env } from "cloudflare:workers";
// // const model = openai("gpt-4o-2024-11-20");
//
// // Cloudflare AI Gateway
// // const openai = createOpenAI({
// //   apiKey: env.OPENAI_API_KEY,
// //   baseURL: env.GATEWAY_BASE_URL,
// // });
//
// // MCP connection
// // const mcpConnection = await this.mcp.connect(
// //   "https://path-to-mcp-server/sse"
// // );
// // ...this.mcp.getAITools()
//
// // Schedule import (unused)
// // import type { Schedule } from "agents";
//
// // getSchedulePrompt import (unused)
// // import { getSchedulePrompt } from "agents";
// // ${getSchedulePrompt({ date: new Date() })}
//
// // executeTask method
// // async executeTask(description: string, _task: Schedule<string>) {
// //   await this.saveMessages([
// //     ...this.messages,
// //     {
// //       id: generateId(),
// //       role: "user",
// //       parts: [
// //         {
// //           type: "text",
// //           text: `Running scheduled task: ${description}`
// //         }
// //       ],
// //       metadata: {
// //         createdAt: new Date()
// //       }
// //     }
// //   ]);
// // }
