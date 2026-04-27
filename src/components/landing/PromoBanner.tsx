import { Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useBanner } from '@/hooks/useBanner';

const PromoBanner = () => {
  const { banner } = useBanner();
  const ref = useRef<HTMLDivElement>(null);

  const visible = !!banner && banner.ativo && !!banner.mensagem.trim();

  // Ajusta padding-top do body conforme altura real da faixa
  useEffect(() => {
    const apply = () => {
      const h = visible && ref.current ? ref.current.offsetHeight : 0;
      document.body.style.paddingTop = h ? `${h}px` : '';
    };
    apply();
    if (!visible) return;
    const ro = new ResizeObserver(apply);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      document.body.style.paddingTop = '';
    };
  }, [visible, banner?.mensagem]);

  if (!visible) return null;

  const items = Array.from({ length: 6 });

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 w-full bg-red-600 text-white overflow-hidden border-b border-red-700/50 shadow-lg"
      style={{ zIndex: 9999 }}
    >
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {items.map((_, i) => (
          <span key={i} className="flex items-center gap-3 px-8 font-bold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-white" />
            {banner!.mensagem}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
