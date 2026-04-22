@AGENTS.md

# AI Image Arena — Claude Code Setup Guide

## What This Project Does

AI Image Arena is a Next.js app that runs a blind head-to-head battle between two AI image generation models (GPT-5.4 Image vs Gemini 3.1 Flash Image). Claude Sonnet 4 generates creative prompts, both models produce images from the same prompts, and Claude Sonnet 4 judges the results round-by-round. Model identities are hidden until the final reveal.

All AI models are accessed through a single OpenRouter API key — no separate OpenAI or Google keys needed.

## First-Time Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` manually:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get your key at https://openrouter.ai/keys. You need credits for:
- `anthropic/claude-sonnet-4` (prompt generation + judging)
- `openai/gpt-5.4-image-2` (image generation)
- `google/gemini-3.1-flash-image-preview` (image generation)

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Project Architecture

```
src/
├── app/
│   ├── page.tsx                    # Root client page — renders arena UI
│   ├── layout.tsx                  # HTML shell + metadata
│   ├── globals.css                 # Tailwind v4 theme (dark mode default, oklch colors)
│   └── api/
│       ├── generate-prompts/       # POST — Claude generates 5 creative prompts
│       ├── generate-image/         # POST — generates one image via OpenRouter
│       └── judge-round/            # POST — Claude judges one image pair
├── components/
│   ├── arena/                      # Battle-specific UI components
│   │   ├── HeroSection.tsx         # Landing screen + start buttons
│   │   ├── BattleGrid.tsx          # Grid of all rounds
│   │   ├── BattleRound.tsx         # Single round display (images + judgment)
│   │   ├── PromptReveal.tsx        # Shows generated prompts
│   │   └── Scoreboard.tsx          # Final results + animated reveal
│   ├── ui/                         # shadcn/ui primitives
│   └── ImageCard.tsx               # Single image display with metadata
├── hooks/
│   └── useBattle.ts                # All battle state + orchestration logic
└── lib/
    ├── types.ts                    # TypeScript interfaces for all data shapes
    ├── constants.ts                # Model IDs, round count, judge model
    ├── openrouter.ts               # OpenRouter client + image generation logic
    └── utils.ts                    # cn() and shared utilities
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/hooks/useBattle.ts` | Core battle orchestration — start here to understand the flow |
| `src/lib/openrouter.ts` | OpenRouter client + `findImageInResponse()` parser for varied model response formats |
| `src/lib/constants.ts` | Model IDs — change these to swap models |
| `src/app/api/generate-image/route.ts` | Image generation endpoint (120s timeout) |
| `src/app/api/judge-round/route.ts` | Multimodal judging endpoint — sends images + prompt to Claude |

## Battle Flow (for context)

1. User clicks "Start Battle" → `useBattle.startBattle(testMode)`
2. Model A/B assigned randomly (revealed only at the end)
3. `/api/generate-prompts` → Claude returns 5 prompts as JSON
4. `/api/generate-image` called in parallel for both models × all prompts
5. `/api/judge-round` called sequentially per round (for UI progression)
6. Scoreboard shown; user can reveal which model was A vs B

## Development Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint check
```

## Tech Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before editing routing or server component code
- **React 19** with server components
- **Tailwind CSS v4** (PostCSS-based, config is in `globals.css` not `tailwind.config.js`)
- **shadcn/ui** with `base-nova` style
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
- **Framer Motion v12** for animations
- **TypeScript** strict mode

## Important Notes for Claude

- **Only one env var is needed**: `OPENROUTER_API_KEY`. All three models (Claude, GPT, Gemini) go through OpenRouter.
- **Tailwind v4** — no `tailwind.config.js`. Theme is defined via CSS custom properties in `globals.css`. Do not create a config file.
- **Next.js 16 breaking changes** — APIs differ from training data. Read `node_modules/next/dist/docs/` before modifying routing, middleware, or server component patterns.
- **Image response parsing** — Different models return images in different formats. `findImageInResponse()` in `openrouter.ts` handles all cases. Do not simplify it.
- **API routes have 120s timeouts** — set via `export const maxDuration = 120` at the top of each route file.
- **Battle state uses refs** — `useBattle.ts` uses `useRef` extensively to avoid stale closures across async operations. Preserve this pattern when editing.
