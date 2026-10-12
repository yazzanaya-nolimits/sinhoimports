import { useState, useEffect, useMemo } from 'react';
import { getWhatsAppLink } from '@/data/products';
import heroPerfume from '@/assets/hero-perfume.jpg';
import heroWatch from '@/assets/hero-watch.jpg';
import { useSiteImages } from '@/hooks/useSiteImages';
import { useCarrossel } from '@/hooks/useCarrossel';
import { Icon } from './Icon';
import { btnOutline, btnPrimary, container, eyebrow } from './styles';

const defaultSlides = [
  { image: heroPerfume, alt: 'Perfume árabe' },
  { image: heroWatch, alt: 'Relógio' },
];

const trust = [
  { icon: 'workspace_premium', text: 'Certificado de autenticidade' },
  { icon: 'local_shipping', text: 'Envio para todo o Brasil' },
  { icon: 'forum', text: 'Atendimento de seg. a sáb.' },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const { capa, carrossel } = useSiteImages();
  const { imagens: carrosselNovo } = useCarrossel();

  // Textos podem ser sobrescritos pelo painel (mesmas chaves de antes)
  const heroTitle =
    localStorage.getItem('sinho_hero_title') || 'Perfumaria árabe original, na sua porta';
  const heroDesc =
    localStorage.getItem('sinho_hero_desc') ||
    'Lattafa, Al Haramain e as casas mais desejadas do Oriente Médio, com envio para todo o Brasil. Não sabe qual escolher? A gente indica pelo WhatsApp.';

  // Imagens vêm do painel (Carrossel / Imagens do site). Sem setas: troca suave a cada 6s.
  const slides = useMemo(() => {
    const novasUrls = carrosselNovo.filter(c => c.ativo).map(c => c.url);
    if (novasUrls.length > 0) return novasUrls.map(url => ({ image: url, alt: 'Sinho Imports' }));
    const remoteUrls: string[] = [];
    if (capa?.url) remoteUrls.push(capa.url);
    carrossel.forEach(c => remoteUrls.push(c.url));
    if (remoteUrls.length > 0) return remoteUrls.map(url => ({ image: url, alt: 'Sinho Imports' }));
    return defaultSlides;
  }, [capa, carrossel, carrosselNovo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  return (
    <section className="bg-sinho-ink">
      <div className={`${container} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-14 lg:py-20`}>
        <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] max-h-[640px] w-full overflow-hidden bg-sinho-panel border border-sinho-line order-2 lg:order-1">
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={i === current ? s.alt : ''}
              aria-hidden={i !== current}
              width={1000}
              height={1250}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding={i === 0 ? 'sync' : 'async'}
            />
          ))}
        </div>

        <div className="flex flex-col gap-7 order-1 lg:order-2">
          <span className={`${eyebrow} text-sinho-gold`}>Importados originais · Envio para todo o Brasil</span>
          <h1
            className="font-display uppercase leading-[1.08] tracking-[0.04em] text-sinho-ivory"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
          >
            {heroTitle}
          </h1>
          <p className="max-w-[520px] text-base sm:text-lg font-light leading-relaxed text-sinho-text">
            {heroDesc}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#produtos" className={btnPrimary}>
              Ver perfumes
              <Icon name="arrow_forward" className="w-5 h-5" />
            </a>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className={btnOutline}>
              <Icon name="forum" className="w-5 h-5" />
              Quero indicação
            </a>
          </div>
          <ul className="grid grid-cols-3 gap-4 pt-7 border-t border-sinho-line">
            {trust.map(t => (
              <li key={t.text} className="flex flex-col gap-2">
                <Icon name={t.icon} className="w-7 h-7 text-sinho-gold" />
                <span className="text-[13px] sm:text-sm leading-snug text-sinho-text">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
