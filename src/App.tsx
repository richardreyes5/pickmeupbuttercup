import { useState } from 'react';
import LandingView from './components/LandingView';
import EnvelopeReveal from './components/EnvelopeReveal';
import { fetchQuote, type Theme } from './services/quoteService';
import type { Quote } from './data/fallbackQuotes';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const handleSelect = async (t: Theme) => {
    setTheme(t);
    setLoading(true);
    const q = await fetchQuote(t);
    setQuote(q);
    setLoading(false);
    setRevealKey((k) => k + 1);
  };

  const handlePickAnother = async () => {
    if (!theme) return;
    setQuote(null);
    setLoading(true);
    const q = await fetchQuote(theme);
    setQuote(q);
    setLoading(false);
    setRevealKey((k) => k + 1);
  };

  const handleBack = () => {
    setTheme(null);
    setQuote(null);
  };

  return (
    <div className="w-full flex items-center justify-center py-12">
      <AnimatePresence mode="wait">
        {!theme ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <LandingView onSelect={handleSelect} />
          </motion.div>
        ) : loading || !quote ? (
          <motion.div
            key="loading"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-8 border-2 border-black relative">
              <div
                className="absolute inset-x-0 top-0 h-4 border-2 border-black bg-neutral-100 animate-pulse"
                style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
              />
            </div>
            <p className="text-neutral-400 text-sm tracking-widest">
              Opening...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`reveal-${revealKey}`}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <EnvelopeReveal
              quote={quote}
              theme={theme}
              onPickAnother={handlePickAnother}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
