import {
  type Quote,
  positivityQuotes,
  gratitudeQuotes,
} from '../data/fallbackQuotes';

export type Theme = 'positivity' | 'gratitude';

const CATEGORY_MAP: Record<Theme, string[]> = {
  positivity: ['inspirational', 'happiness'],
  gratitude: ['happiness', 'love'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFallbackQuote(theme: Theme): Quote {
  const pool = theme === 'positivity' ? positivityQuotes : gratitudeQuotes;
  return pickRandom(pool);
}

export async function fetchQuote(theme: Theme): Promise<Quote> {
  const apiKey = import.meta.env.VITE_API_NINJAS_KEY;
  if (!apiKey) return getFallbackQuote(theme);

  const category = pickRandom(CATEGORY_MAP[theme]);

  try {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/quotes?category=${category}`,
      { headers: { 'X-Api-Key': apiKey } },
    );

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    if (data.length > 0) {
      return { text: data[0].quote, author: data[0].author };
    }

    return getFallbackQuote(theme);
  } catch {
    return getFallbackQuote(theme);
  }
}
