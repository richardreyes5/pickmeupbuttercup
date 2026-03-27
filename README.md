# PickMeUpButterCup — Project Walkthrough

A simple, elegant web app for positivity and gratitude. Pick a theme, and an animated envelope opens to reveal an inspiring quote.

Live: [pickmeupbuttercup.vercel.app](https://pickmeupbuttercup.vercel.app)

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [How We Built It — Step by Step](#how-we-built-it--step-by-step)
   - [Phase 1: Scaffold and Layout](#phase-1-scaffold-and-layout)
   - [Phase 2: Quote Service and Data](#phase-2-quote-service-and-data)
   - [Phase 3: Envelope Animation](#phase-3-envelope-animation)
   - [Phase 4: Polish and Responsive Design](#phase-4-polish-and-responsive-design)
4. [How the App Works at Runtime](#how-the-app-works-at-runtime)
5. [Key Concepts Explained](#key-concepts-explained)
6. [Deployment](#deployment)
7. [Local Development](#local-development)

---

## Tech Stack

| Tool | What it does |
|------|-------------|
| **Vite** | Build tool and dev server. Handles bundling, hot module replacement (HMR), and environment variables. |
| **React 19** | UI library. We use functional components and hooks (`useState`) to manage what the user sees. |
| **TypeScript** | Adds type safety to JavaScript. Catches bugs at build time instead of runtime. |
| **Tailwind CSS v4** | Utility-first CSS framework. Instead of writing CSS files, you style elements with class names like `text-black`, `px-8`, `border-2`. |
| **Framer Motion** | Animation library for React. Provides `motion.div` components that animate with simple props like `initial`, `animate`, and `transition`. |
| **Special Elite** | A Google Font with a typewriter aesthetic, loaded via `index.html`. |
| **API Ninjas** | External quotes API (optional). Free tier, 10k requests/month. |

---

## Project Structure

```
pickmeupbuttercup/
├── index.html                  # The single HTML page that loads everything
├── vite.config.ts              # Vite + Tailwind plugin configuration
├── package.json                # Dependencies and npm scripts
├── .env                        # Your API key (not committed to git)
├── .env.example                # Template showing what env vars are needed
├── public/
│   └── favicon.svg             # Envelope icon shown in the browser tab
└── src/
    ├── main.tsx                # Entry point — mounts React into the DOM
    ├── index.css               # Tailwind import + custom font setup
    ├── App.tsx                 # Root component — state machine for the whole app
    ├── components/
    │   ├── LandingView.tsx     # Title + two theme buttons
    │   ├── EnvelopeReveal.tsx  # Animated envelope with layered CSS + Framer Motion
    │   └── QuoteCard.tsx       # Quote text and author on the "paper"
    ├── services/
    │   └── quoteService.ts     # Fetches quotes from API or falls back to local data
    └── data/
        └── fallbackQuotes.ts   # 30 curated quotes (15 per theme)
```

---

## How We Built It — Step by Step

### Phase 1: Scaffold and Layout

**Goal:** Get a working React app with Tailwind and the typewriter font, showing two buttons.

**1. Created the Vite project**

We used Vite's project scaffolder to generate a React + TypeScript starter:

```bash
npm create vite@latest . -- --template react-ts
```

This gave us a working React app with TypeScript, ESLint, and a dev server out of the box.

**2. Installed dependencies**

```bash
npm install                          # Base dependencies (React, etc.)
npm install -D tailwindcss @tailwindcss/vite  # Tailwind CSS v4 + Vite plugin
npm install framer-motion            # Animation library
```

**3. Configured Vite to use Tailwind**

In `vite.config.ts`, we added the Tailwind plugin alongside the React plugin:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

This tells Vite to process Tailwind utility classes during development and builds.

**4. Set up the typewriter font**

In `index.html`, we added Google Fonts links to load "Special Elite":

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet" />
```

- `preconnect` tells the browser to start connecting to Google's font servers early, so the font loads faster.

In `src/index.css`, we registered the font with Tailwind v4's `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --font-typewriter: 'Special Elite', 'Courier New', monospace;
}

body {
  font-family: var(--font-typewriter);
}
```

- `@import "tailwindcss"` — this single line enables all of Tailwind's utility classes.
- `@theme` — Tailwind v4's way of extending the design system. We defined a custom font variable so Tailwind knows about it.
- The `body` rule applies the typewriter font globally.

**5. Built the LandingView component**

`src/components/LandingView.tsx` is a simple centered layout:

```tsx
export default function LandingView({ onSelect }: Props) {
  return (
    <motion.div className="flex flex-col items-center gap-12 px-6" ...>
      <h1>PickMeUpButterCup</h1>
      <p>Choose your dose of goodness</p>
      <button onClick={() => onSelect('positivity')}>Positivity</button>
      <button onClick={() => onSelect('gratitude')}>Gratitude</button>
    </motion.div>
  );
}
```

Key Tailwind classes used:
- `flex flex-col items-center` — vertical centering with flexbox
- `gap-12` — spacing between children (3rem)
- `border-2 border-black` — solid black border on buttons
- `hover:bg-black hover:text-white` — inverts colors on hover
- `active:scale-95` — subtle press-down effect on click

The component receives an `onSelect` callback prop. When a button is clicked, it tells the parent (`App`) which theme was chosen.

---

### Phase 2: Quote Service and Data

**Goal:** Fetch themed quotes from an API, with a reliable local fallback.

**1. Created the fallback quote bank**

`src/data/fallbackQuotes.ts` exports two arrays — 15 quotes each for positivity and gratitude:

```ts
export interface Quote {
  text: string;
  author: string;
}

export const positivityQuotes: Quote[] = [
  { text: "Keep your face always toward the sunshine...", author: "Walt Whitman" },
  // ... 14 more
];

export const gratitudeQuotes: Quote[] = [
  { text: "Gratitude turns what we have into enough.", author: "Aesop" },
  // ... 14 more
];
```

The `Quote` interface is the single data shape used everywhere in the app. Defining it here means all components agree on what a quote looks like.

**2. Built the quote service**

`src/services/quoteService.ts` has one main function: `fetchQuote(theme)`.

The logic flow:
1. Check if an API key exists in the environment (`import.meta.env.VITE_API_NINJAS_KEY`)
2. If no key, immediately return a random local quote
3. If key exists, call the API Ninjas `/quotes` endpoint with a mapped category
4. If the API call fails for any reason, fall back to a local quote

```ts
export async function fetchQuote(theme: Theme): Promise<Quote> {
  const apiKey = import.meta.env.VITE_API_NINJAS_KEY;
  if (!apiKey) return getFallbackQuote(theme);  // No key? Use local quotes.

  try {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/quotes?category=${category}`,
      { headers: { 'X-Api-Key': apiKey } },
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return { text: data[0].quote, author: data[0].author };
  } catch {
    return getFallbackQuote(theme);  // API failed? Use local quotes.
  }
}
```

**Why the fallback pattern matters:** External APIs can go down, rate-limit you, or change without warning. By always having local data ready, the app never shows a blank screen. The user doesn't even know the difference.

**Category mapping:** API Ninjas doesn't have "positivity" or "gratitude" as categories. We map them to the closest available ones:
- Positivity -> `inspirational` or `happiness`
- Gratitude -> `happiness` or `love`

**Environment variables:** Vite exposes env vars prefixed with `VITE_` to client-side code via `import.meta.env`. The key is set in a `.env` file locally and as an environment variable on Vercel for production.

---

### Phase 3: Envelope Animation

**Goal:** Build an animated envelope that opens and reveals the quote on a piece of paper.

This is the most complex part of the app. The envelope is built with pure CSS (no images) and animated with Framer Motion.

**The envelope has 4 visual layers (back to front):**

```
Layer 1 (z-0):  Envelope back    — full rectangle, light background
Layer 2 (z-10): Paper            — the quote card, starts hidden inside
Layer 3 (z-20): Envelope front   — bottom portion with a V-shaped top edge
Layer 4 (z-30): Flap             — triangle that rotates open
```

**How the layers work together:**

The paper starts positioned *behind* the front panel (lower z-index), so it's hidden. As it animates upward, the portion that rises *above* the front panel becomes visible — creating the illusion of pulling a letter out of an envelope.

**The animation sequence (timed with delays):**

| Time | What happens | Framer Motion props |
|------|-------------|-------------------|
| 0.0s | Envelope slides up and fades in | `initial={{ y: 60, opacity: 0 }}` -> `animate={{ y: 0, opacity: 1 }}` |
| 0.5s | Flap rotates backward (3D flip) | `initial={{ rotateX: 0 }}` -> `animate={{ rotateX: 180 }}` |
| 1.0s | Paper slides upward out of envelope | `initial={{ y: 60 }}` -> `animate={{ y: -160 }}` |
| 1.6s | Quote text fades in on paper | `initial={{ opacity: 0 }}` -> `animate={{ opacity: 1 }}` |
| 1.9s | Author name fades in | Same pattern, later delay |
| 2.2s | Action buttons appear | Same pattern, latest delay |

**Key CSS techniques used:**

- `perspective: 900px` on the parent — enables 3D transforms so the flap rotation looks realistic
- `transformOrigin: 'bottom center'` on the flap — makes it hinge from its base, like a real envelope flap
- `clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)'` — creates the triangle shape for the flap using CSS clipping
- `backfaceVisibility: 'hidden'` — hides the flap once it rotates past 90 degrees (it would otherwise show reversed)
- `transformStyle: 'preserve-3d'` — ensures child elements participate in the 3D space

**The custom easing `[0.22, 1, 0.36, 1]`** is a cubic bezier curve that starts fast and decelerates smoothly. It gives the paper and flap a natural, physical feel — like something being pulled or folded.

---

### Phase 4: Polish and Responsive Design

**Goal:** Make it look good on all screen sizes, add loading states, and handle transitions.

**1. Responsive design with Tailwind breakpoints**

Tailwind uses mobile-first breakpoints. Classes without a prefix apply to all screen sizes. The `sm:` prefix applies at 640px and above:

```tsx
// Envelope is 320px on mobile, 380px on larger screens
className="w-[320px] sm:w-[380px]"

// Buttons stack vertically on mobile, side-by-side on larger screens
className="flex flex-col sm:flex-row gap-4 sm:gap-6"

// Text is smaller on mobile, larger on desktop
className="text-4xl sm:text-5xl"
```

**2. Loading state**

While the quote is being fetched, we show a miniature sealed envelope with a pulsing animation:

```tsx
<div className="w-12 h-8 border-2 border-black relative">
  <div className="... animate-pulse"
    style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
  />
</div>
<p>Opening...</p>
```

`animate-pulse` is a built-in Tailwind animation that fades the element in and out.

**3. View transitions with AnimatePresence**

`AnimatePresence` from Framer Motion handles smooth transitions between views:

```tsx
<AnimatePresence mode="wait">
  {!theme ? (
    <motion.div key="landing" exit={{ opacity: 0, y: -20 }}>
      <LandingView />
    </motion.div>
  ) : loading ? (
    <motion.div key="loading" ...>Loading...</motion.div>
  ) : (
    <motion.div key={`reveal-${revealKey}`} ...>
      <EnvelopeReveal />
    </motion.div>
  )}
</AnimatePresence>
```

- `mode="wait"` — the exiting view fully animates out before the entering view starts
- `key` prop — React and Framer Motion use this to know when a component has changed. Changing the key forces a fresh mount with a new animation
- `revealKey` — a counter that increments each time we fetch a new quote, which restarts the envelope animation even when staying on the same view

---

## How the App Works at Runtime

Here's the complete flow when a user visits the site:

```
1. Browser loads index.html
2. index.html loads the Google Font and src/main.tsx
3. main.tsx mounts the <App /> component into the #root div
4. App renders LandingView (two buttons)
5. User clicks "Positivity"
   ├── App sets theme = 'positivity', loading = true
   ├── App calls fetchQuote('positivity')
   │   ├── If API key exists: calls API Ninjas with category 'inspirational' or 'happiness'
   │   └── If no key or API fails: picks random quote from positivityQuotes array
   ├── App receives the quote, sets loading = false
   └── App renders EnvelopeReveal with the quote
6. EnvelopeReveal plays the animation sequence (flap opens, paper rises, quote fades in)
7. User can:
   ├── Click "Pick Another" → repeats steps 5-6 with same theme
   └── Click "Back" → returns to step 4
```

---

## Key Concepts Explained

### What is Vite?
Vite is a build tool that does two things:
- **During development:** Runs a fast dev server with hot module replacement (HMR). When you save a file, the browser updates instantly without a full page reload.
- **During production build:** Bundles all your code, CSS, and assets into optimized static files in the `dist/` folder.

### What is TypeScript?
TypeScript is JavaScript with type annotations. For example:

```ts
// JavaScript — no type safety
function add(a, b) { return a + b; }
add("hello", 5); // No error, returns "hello5" — probably a bug

// TypeScript — catches the bug
function add(a: number, b: number): number { return a + b; }
add("hello", 5); // Error: Argument of type 'string' is not assignable to type 'number'
```

### What is Tailwind CSS?
Instead of writing CSS in separate files, you apply styles directly in your HTML/JSX using utility classes:

```tsx
// Traditional CSS approach
<div className="card">  →  .card { display: flex; padding: 2rem; border: 1px solid black; }

// Tailwind approach (no separate CSS file needed)
<div className="flex p-8 border border-black">
```

### What is Framer Motion?
A React animation library. You wrap elements with `motion.div` and describe animations declaratively:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}   // Starting state
  animate={{ opacity: 1, y: 0 }}    // End state
  transition={{ duration: 0.5 }}     // How long it takes
>
  This fades in and slides up over 0.5 seconds
</motion.div>
```

### What are Environment Variables?
Values stored outside your code, usually for secrets or configuration that varies between environments. In Vite:
- Defined in a `.env` file: `VITE_API_NINJAS_KEY=abc123`
- Accessed in code: `import.meta.env.VITE_API_NINJAS_KEY`
- The `VITE_` prefix is required — Vite only exposes prefixed vars to prevent accidentally leaking secrets

---

## Deployment

The app is deployed on **Vercel**, which:
1. Connects to the GitHub repo
2. On every `git push` to `main`, automatically runs `npm run build`
3. Serves the `dist/` output as a static site on a global CDN
4. Environment variables (like the API key) are set in the Vercel dashboard

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check
npx tsc -b

# Production build
npm run build

# Preview production build locally
npm run preview
```

To use the external quotes API locally, create a `.env` file:

```
VITE_API_NINJAS_KEY=your_key_here
```

Without the key, the app works perfectly using the 30 built-in curated quotes.
