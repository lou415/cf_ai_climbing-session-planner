# 🧗 Climbing Session Planner

An AI-powered training session planner for rock climbers, built on [Cloudflare's Agents platform](https://developers.cloudflare.com/agents/).

**[Try it live →](https://climbing-session-planner.luis-frnando42.workers.dev)**

---

## What It Does

This agent helps climbers structure their training sessions based on their ability level, goals, and available time. Instead of sifting through the mountain of training information in climbing circles, you tell it:

- Your climbing grades (bouldering and/or sport)
- Your weaknesses (crimps, slopers, body tension, etc.)
- Any injuries to work around
- How much time you have
- What you want to focus on today

It generates a structured session plan with warm-up, skill work, main session, and cool-down — personalized to you.

---

## Why I Built This

Anyone who's gotten serious about climbing knows the problem: there's an overwhelming amount of training information out there. Hangboard protocols, 4x4s, periodization schemes, technique drills — it's amazing these resources exist, but also paralyzing when you just want to know what to do with your 90 minutes at the gym.

This prototype isn't an end-all solution (training is personal and context-dependent), but it gives people a reasonable starting point instead of analysis paralysis.

---

## Features

- **Profile Memory** — Saves your grades, weaknesses, goals, and injuries so you don't repeat yourself
- **Personalized Plans** — Sessions tailored to your level and focus areas
- **Coaching Knowledge** — Built-in expertise on session structure, strength training, technique drills, and endurance work
- **Injury Awareness** — Respects limitations and suggests modifications

---

## Tech Stack

- **[Cloudflare Agents SDK](https://developers.cloudflare.com/agents/)** — Agent framework with built-in state management
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — Edge deployment
- **[Claude API](https://www.anthropic.com/)** — AI model for natural conversation and plan generation
- **TypeScript** — Type-safe tooling
- **React** — Chat interface

---

## Tools

The agent has two custom tools:

| Tool | Purpose |
|------|---------|
| `setClimberProfile` | Saves user info: bouldering grade, sport grade, weaknesses, injuries, goals |
| `generateSessionPlan` | Creates a structured session based on saved profile + session-specific inputs (duration, focus, setting, discipline) |

---

## Example Usage

**Setting your profile:**
> "I'm a V5 boulderer and climb 5.10c sport. My weaknesses are slopers and body tension. I tweaked my left ring finger last month. My goal is to climb V7 by summer."

**Getting a session plan:**
> "I've got 90 minutes today for indoor bouldering. Want to focus on body positioning and weight shifting."

**Quick session:**
> "Quick 45 minute endurance session, sport climbing at the gym"

---

## Local Development

### Prerequisites

- Node.js (v20+)
- npm
- Cloudflare account
- Anthropic API key

### Setup

1. Clone the repo:
```bash
git clone https://github.com/YOUR_USERNAME/climbing-session-planner.git
cd climbing-session-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create `.dev.vars` file:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run locally:
```bash
npm start
```

5. Open `http://localhost:5173`

### Deployment

1. Add your API key as a secret:
```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

2. Deploy:
```bash
npm run deploy
```

---

## Roadmap

- [ ] **RAG Integration** — Use Cloudflare Vectorize to pull from curated training resources dynamically
- [ ] **Session History** — Track past sessions and suggest progressions
- [ ] **Workout Database** — Structured library of drills and exercises
- [ ] **Progress Tracking** — Monitor grade improvements over time

---

## Project Structure

```
src/
├── app.tsx        # React chat interface
├── server.ts      # Agent logic and system prompt
├── tools.ts       # Custom tool definitions (setClimberProfile, generateSessionPlan)
└── utils.ts       # Helper functions
```

---

## Acknowledgments

Built using:
- [Cloudflare Agents Starter Template](https://github.com/cloudflare/agents-starter)
- [Anthropic Claude API](https://www.anthropic.com/)

---

## License

MIT
