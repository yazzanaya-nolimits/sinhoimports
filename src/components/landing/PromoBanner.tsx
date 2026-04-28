import { Zap } from 'lucide-react';
import { useBanner } from '@/hooks/useBanner';

const PromoBanner = () => {
  const { banner } = useBanner();
  const visible = !!banner && banner.ativo && !!banner.mensagem.trim();

  if (!visible) return null;

  const items = Array.from({ length: 6 });

  return (
    <div className="relative w-full bg-red-600 text-white overflow-hidden border-b border-red-700/50 shadow-lg">
      <div className="flex animate-marquee whitespace-nowrap py-1.5 sm:py-2">
        {items.map((_, i) => (
          <span
            key={i}
            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-8 font-bold uppercase tracking-wider"
            style={{ fontSize: 'clamp(0.7rem, 2.2vw, 0.875rem)' }}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
            {banner!.mensagem}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
