# AI Image Arena

A blind head-to-head battle between AI image generation models. Two models compete by generating images from the same prompts — you don't know which model made which image until the final reveal. Claude Opus 4 judges each round and declares a winner.

## How It Works

1. **Prompts** — Claude Sonnet 4 generates 5 creative prompts across different categories (photorealism, artistic style, fantasy, abstract, portraits)
2. **Generate** — Both models generate images in parallel from the same prompts
3. **Judge** — Claude Opus 4 scores each pair on Creativity, Quality, and Prompt Adherence (1–10)
4. **Reveal** — After all rounds, the final scoreboard shows the winner and reveals which model was A vs B

The model assignment is randomized each battle so there's no bias in the judging.

## Models

| Role | Model |
|------|-------|
| Image Generator A | GPT-5.4 Image (`openai/gpt-5.4-image-2`) |
| Image Generator B | Gemini 3.1 Flash Image (`google/gemini-3.1-flash-image-preview`) |
| Prompt Generator | Claude Sonnet 4 (`anthropic/claude-sonnet-4`) |
| Judge | Claude Opus 4 (`anthropic/claude-opus-4`) |

All models are accessed through [OpenRouter](https://openrouter.ai) — one API key, no separate provider accounts needed.

## Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) account with API credits

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/raxx21/ai-image-arena.git
cd ai-image-arena
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get your API key from https://openrouter.ai/keys. Make sure your account has credits for the three models listed above.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Start Battle (5 Rounds)** — Full battle with 5 prompts and rounds
- **Test Run (1 Round)** — Quick single-round test to verify your API key works

Each battle takes 1–3 minutes depending on model response times. Images generate in parallel; judging happens round by round so you can watch the scores come in live.

After the final round, click **Reveal Models** on the scoreboard to see which model was A vs B.

## Deploying to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/raxx21/ai-image-arena)

After deploying, add `OPENROUTER_API_KEY` to your project's Environment Variables in the Vercel dashboard.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Vercel AI SDK v6](https://sdk.vercel.ai)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [OpenRouter](https://openrouter.ai)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main arena page
│   └── api/
│       ├── generate-prompts/ # Prompt generation endpoint
│       ├── generate-image/   # Image generation endpoint
│       └── judge-round/      # Round judging endpoint
├── components/arena/         # Battle UI components
├── hooks/useBattle.ts        # Battle state and orchestration
└── lib/
    ├── constants.ts          # Model IDs (edit to swap models)
    └── openrouter.ts         # OpenRouter API integration
```

## Swapping Models

To use different image generation models, edit `src/lib/constants.ts`:

```ts
export const MODEL_A_ID = "openai/gpt-5.4-image-2";
export const MODEL_B_ID = "google/gemini-3.1-flash-image-preview";
```

Replace with any image-capable model available on OpenRouter.
