import { motion } from 'framer-motion';
import type { Quote } from '../data/fallbackQuotes';
import type { Theme } from '../services/quoteService';
import QuoteCard from './QuoteCard';

interface Props {
  quote: Quote;
  theme: Theme;
  onPickAnother: () => void;
  onBack: () => void;
}

export default function EnvelopeReveal({
  quote,
  theme,
  onPickAnother,
  onBack,
}: Props) {
  const label = theme === 'positivity' ? 'Positivity' : 'Gratitude';

  return (
    <motion.div
      className="flex flex-col items-center gap-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.p
        className="text-sm tracking-widest uppercase text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {label}
      </motion.p>

      {/* Envelope scene */}
      <div style={{ perspective: '900px' }} className="relative">
        {/* Wrapper that slides up */}
        <motion.div
          className="relative"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Paper — slides upward out of envelope */}
          <motion.div
            className="absolute left-3 right-3 z-10"
            style={{ bottom: '40%' }}
            initial={{ y: 60 }}
            animate={{ y: -160 }}
            transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="border border-neutral-300 bg-white shadow-md"
              style={{ minHeight: '180px' }}
            >
              <QuoteCard quote={quote} />
            </div>
          </motion.div>

          {/* Envelope body (back) */}
          <div
            className="relative w-[320px] sm:w-[380px] border-2 border-black bg-neutral-50 overflow-hidden"
            style={{ height: '220px' }}
          >
            {/* Inner "V" line decoration */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
              viewBox="0 0 380 220"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="0" x2="190" y2="110" stroke="black" strokeWidth="1" />
              <line x1="380" y1="0" x2="190" y2="110" stroke="black" strokeWidth="1" />
            </svg>
          </div>

          {/* Envelope front (bottom portion — covers paper) */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 border-2 border-black border-t-0 bg-neutral-100"
            style={{
              height: '60%',
              clipPath: 'polygon(0% 30%, 50% 0%, 100% 30%, 100% 100%, 0% 100%)',
            }}
          />

          {/* Flap — rotates open */}
          <motion.div
            className="absolute top-0 left-0 right-0 z-30"
            style={{
              height: '50%',
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: 180 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-full h-full border-2 border-black bg-neutral-100"
              style={{
                clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
                backfaceVisibility: 'hidden',
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.4 }}
      >
        <button
          onClick={onPickAnother}
          className="px-6 py-2 text-sm border-2 border-black text-black bg-white
                     transition-all duration-200
                     hover:bg-black hover:text-white
                     active:scale-95 cursor-pointer"
        >
          Pick Another
        </button>
        <button
          onClick={onBack}
          className="px-6 py-2 text-sm border-2 border-neutral-300 text-neutral-500
                     transition-all duration-200
                     hover:border-black hover:text-black
                     active:scale-95 cursor-pointer"
        >
          Back
        </button>
      </motion.div>
    </motion.div>
  );
}
