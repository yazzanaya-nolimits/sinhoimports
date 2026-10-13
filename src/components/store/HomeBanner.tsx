import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import heroPerfume from '@/assets/hero-perfume.jpg';
import heroWatch from '@/assets/hero-watch.jpg';
import { useSiteImages } from '@/hooks/useSiteImages';
import { useCarrossel } from '@/hooks/useCarrossel';
import { Icon } from '@/components/icons';
import { btnGold } from './ui';

/**
 * Banner de campanha. Textos: chaves sinho_hero_title / sinho_hero_desc (painel);
 * imagens: Carrossel ou Imagens do site no painel.
 */
const HomeBanner = ({ couponCode }: { couponCode?: string | null }) => {
  const { capa, carrossel } = useSiteImages();
  const { imagens } = useCarrossel();
  const [current, setCurrent] = useState(0);

  const title = localStorage.getItem('sinho_hero_title') || 'Perfumaria árabe original';
  const desc =
    localStorage.getItem('sinho_hero_desc') ||
    'Lattafa, Al Haramain e as casas mais desejadas do Oriente Médio, com certificado de autenticidade e envio para todo o Brasil.';

  const slides = useMemo(() => {
    const novas = imagens.filter(c => c.ativo).map(c => c.url);
    if (novas.length) return novas;
    const antigas = [capa?.url, ...carrossel.map(c => c.url)].filter(Boolean) as string[];
    return antigas.length ? antigas : [heroPerfume, heroWatch];
  }, [imagens, capa, carrossel]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  const go = (d: 1 | -1) => setCurrent(i => (i + d + slides.length) % slides.length);

  return (
    <section aria-label="Campanha" aria-roledescription="carrossel">
      <div className="relative bg-sinho-ink text-sinho-ivory overflow-hidden">
        <div className="mx-auto max-w-[1360px] grid lg:grid-cols-2 items-stretch">
          <div className="px-6 sm:px-12 lg:pl-20 lg:pr-12 py-12 sm:py-16 flex flex-col items-start justify-center gap-5 sm:gap-6">
            {couponCode ? (
              <span className="px-3.5 py-1.5 rounded-full border border-sinho-gold text-[11px] sm:text-xs tracking-[0.22em] uppercase text-sinho-gold">
                Oferta da semana
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full border border-sinho-gold text-[11px] sm:text-xs tracking-[0.22em] uppercase text-sinho-gold">
                Sinho Imports
              </span>
            )}
            <h1 className="font-display uppercase leading-[1.06] tracking-[0.04em]" style={{ fontSize: 'clamp(2.25rem, 4.6vw, 4rem)' }}>
              {title}
            </h1>
            <p className="max-w-[460px] text-base sm:text-lg font-light leading-relaxed text-sinho-text">{desc}</p>
            {couponCode && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs sm:text-[13px] tracking-[0.2em] uppercase text-sinho-text">Cupom</span>
                <span className="px-6 py-2.5 rounded-full border-[1.5px] border-sinho-gold font-display text-xl sm:text-2xl tracking-[0.2em]">
                  {couponCode}
                </span>
              </div>
            )}
            <Link to="/catalogo" className={`${btnGold} mt-1`}>
              Comprar agora <Icon name="arrow_forward" className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-[520px] bg-sinho-panel">
            {slides.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt=""
                aria-hidden={i !== current}
                width={1200}
                height={1000}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${i === current ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Imagem anterior" className="hidden md:inline-flex absolute left-5 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-sinho-ivory text-sinho-dark hover:bg-white transition-colors">
              <Icon name="chevron_left" className="w-7 h-7" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima imagem" className="hidden md:inline-flex absolute right-5 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-sinho-ivory text-sinho-dark hover:bg-white transition-colors">
              <Icon name="chevron_right" className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1 py-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Ir para imagem ${i + 1}`}
              aria-current={i === current}
              className="w-7 h-7 inline-flex items-center justify-center"
            >
              <span className={`block rounded-full transition-all ${i === current ? 'w-2.5 h-2.5 bg-sinho-dark' : 'w-2 h-2 bg-[#D8CDB8]'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeBanner;
