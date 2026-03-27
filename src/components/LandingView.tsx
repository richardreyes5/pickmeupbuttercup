import { motion } from 'framer-motion';
import type { Theme } from '../services/quoteService';

interface Props {
  onSelect: (theme: Theme) => void;
}

export default function LandingView({ onSelect }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center gap-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl tracking-tight text-black mb-3">
          PickMeUpButterCup
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg">
          Choose your dose of goodness
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <button
          onClick={() => onSelect('positivity')}
          className="px-8 py-3 text-lg border-2 border-black text-black bg-white
                     transition-all duration-200
                     hover:bg-black hover:text-white
                     active:scale-95 cursor-pointer"
        >
          Positivity
        </button>
        <button
          onClick={() => onSelect('gratitude')}
          className="px-8 py-3 text-lg border-2 border-black text-black bg-white
                     transition-all duration-200
                     hover:bg-black hover:text-white
                     active:scale-95 cursor-pointer"
        >
          Gratitude
        </button>
      </div>
    </motion.div>
  );
}
