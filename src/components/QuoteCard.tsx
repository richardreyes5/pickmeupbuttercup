import { motion } from 'framer-motion';
import type { Quote } from '../data/fallbackQuotes';

interface Props {
  quote: Quote;
}

export default function QuoteCard({ quote }: Props) {
  return (
    <div className="bg-white w-full h-full flex flex-col justify-center px-6 py-8">
      <motion.p
        className="text-base sm:text-lg leading-relaxed text-black mb-4 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
      >
        &ldquo;{quote.text}&rdquo;
      </motion.p>
      <motion.span
        className="text-sm text-neutral-500 self-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.4 }}
      >
        &mdash; {quote.author}
      </motion.span>
    </div>
  );
}
