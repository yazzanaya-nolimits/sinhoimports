import { Zap } from 'lucide-react';
import { useBanner } from '@/hooks/useBanner';

const PromoBanner = () => {
  const { banner } = useBanner();
  if (!banner || !banner.ativo || !banner.mensagem.trim()) return null;

  // Repete a mensagem para criar efeito contínuo
  const items = Array.from({ length: 6 });

  return (
    <div className="w-full bg-red-600 text-white overflow-hidden border-b border-red-700/50 shadow-lg">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {items.map((_, i) => (
          <span key={i} className="flex items-center gap-3 px-8 font-bold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-white" />
            {banner.mensagem}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
