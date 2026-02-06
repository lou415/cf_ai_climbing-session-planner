# AI-Assisted Development Prompts

This project was built with AI assistance (Claude). Below are the key prompts used during development.

---

## Project Setup & Configuration

### Initial Setup
> "ok I'm ready to start this thing! I think I got the basics for starting the project. That's downloading the npm and npx modules right?"

### Switching to Workers AI
> "oh ok, let's switch to their workersAI"

### Switching to Anthropic Claude
> "No, I'd rather not hard code it. I have claude Pro, is there a way to connect Claude to it similar to how we were going to connect the open api key?"

---

## Tool Development

### Understanding Tool Structure
> "so far so good, I added an additional one in focus called technique which could include: heelhooks, body tension, weight shifting, dynamic movement, body positioning. and for setting, I added another layer of specificity: in addition to indoor or outdoor, we also have sport climbing or bouldering."

### Designing Tool Inputs
> "Yes we should allow multiple session, we should also allow for seperate fields for the grades. Sport climb grades are generally based off the crux of the climb, but don't take into account the other smaller cruxes that a climber may face. I like the output structure."

### State Management
> "since I used my own Anthropic API key, that means anyone that wants to use it will have to use their own too right? Was there a way to avoid this?"

### Adding User Profile Persistence
> "Could we store the user's in context so that it's always personalized to the user when they ask the agent?"

---

## Code Cleanup

### Removing Unused Tools
> "I'm going to ask claude code to clean up the tools.ts file, give me a prompt that I can ask it so that it removes any tools that are not associated with the climbing session agent"

### Commenting Out vs Deleting
> "Give me a prompt that comments it out rather than deleting it all. Have it move all the commented sections below my climbing session code"

---

## Debugging

### MCP Error Fix
> "sent a message, got hit with this error" (regarding jsonSchema not initialized)

### TypeScript Warnings
> "ok I added it, but I get a warning where we declare agent!.setState({...agent!},,,) saying spread types may only be created from object types."

### OpenAI Key Check Removal
> "walk me through option 1" (regarding removing the OpenAI API key check from the frontend)

---

## Deployment

### Initial Deployment
> "no, let's work on deployment"

### GitHub Push
> "help me push it to github with a dedicated read me file and context around the project based on what we talked about"
