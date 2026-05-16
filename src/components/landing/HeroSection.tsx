import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink } from '@/data/products';
import heroPerfume from '@/assets/hero-perfume.jpg';
import heroWatch from '@/assets/hero-watch.jpg';
import heroMultimedia from '@/assets/hero-multimedia.jpg';
import { useSiteImages } from '@/hooks/useSiteImages';
import { useCarrossel } from '@/hooks/useCarrossel';

const defaultSlides = [
  { image: heroPerfume, label: 'Perfumes Árabes', caption: 'Fragrâncias originais importadas' },
  { image: heroWatch, label: 'Relógios de Luxo', caption: 'Rolex, Bulgari, Invicta' },
  { image: heroMultimedia, label: 'Multimídia Auto', caption: 'Tecnologia premium para seu carro' },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const { capa, carrossel } = useSiteImages();
  const { imagens: carrosselNovo } = useCarrossel();
  const heroTitle = localStorage.getItem('sinho_hero_title') || 'Luxo Original para Todo Brasil';
  const heroDesc =
    localStorage.getItem('sinho_hero_desc') ||
    'Perfumes árabes originais, relógios de luxo e acessórios premium. Qualidade garantida com envio para todo o país.';

  const slides = useMemo(() => {
    // Prioridade 1: nova tabela carrossel_imagens (apenas ativos)
    const novasUrls = carrosselNovo.filter(c => c.ativo).map(c => c.url);
    if (novasUrls.length > 0) {
      return novasUrls.map(url => ({ image: url, label: '', caption: '' }));
    }
    // Prioridade 2: capa + carrossel antigo (compatibilidade)
    const remoteUrls: string[] = [];
    if (capa?.url) remoteUrls.push(capa.url);
    carrossel.forEach(c => remoteUrls.push(c.url));
    if (remoteUrls.length > 0) {
      return remoteUrls.map(url => ({ image: url, label: '', caption: '' }));
    }
    return defaultSlides;
  }, [capa, carrossel, carrosselNovo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const safeIndex = slides.length > 0 ? current % slides.length : 0;
  const slide = slides[safeIndex] ?? defaultSlides[0];

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);
  const [titleLine1, ...rest] = heroTitle.split(' para ');
  const titleLine2 = rest.length > 0 ? 'para ' + rest.join(' para ') : '';

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background image with crossfade */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={s.image}
              alt={s.label}
              width={1920}
              height={1080}
              className="w-full h-full object-cover scale-105"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding={i === 0 ? 'sync' : 'async'}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 border border-primary/40 px-4 py-1.5 rounded-full bg-background/40 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs tracking-[0.3em] uppercase text-primary/90">
                {slide.label}
              </span>
            </div>
            <h1
              className="font-serif font-bold leading-tight"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}
            >
              {titleLine1}
              {titleLine2 && (
                <>
                  <br />
                  <span className="text-gradient-gold">{titleLine2}</span>
                </>
              )}
            </h1>
            <p
              className="text-muted-foreground max-w-md leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)' }}
            >
              {heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-gold text-primary-foreground font-semibold px-8 hover:opacity-90 transition-opacity shadow-gold"
                onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Produtos
              </Button>
              <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" asChild>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-[28rem] h-[28rem] mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-20 blur-3xl animate-pulse" />
              <div className="absolute inset-4 rounded-3xl overflow-hidden border border-primary/30 shadow-gold">
                {slides.map((s, i) => (
                  <img
                    key={i}
                    src={s.image}
                    alt={s.label}
                    width={448}
                    height={448}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${
                      i === current ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              <div className="absolute -bottom-2 left-6 right-6 bg-background/85 backdrop-blur-md rounded-xl p-4 border border-primary/30 shadow-xl">
                <p className="text-xs tracking-widest uppercase text-primary/80">{slide.label}</p>
                <p className="font-serif font-semibold text-lg mt-1">{slide.caption}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-10 bg-primary shadow-[0_0_10px_hsl(var(--primary))]' : 'w-2 bg-muted-foreground/40'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrent(i => (i - 1 + slides.length) % slides.length)}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 border border-primary/20 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent(i => (i + 1) % slides.length)}
        aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 border border-primary/20 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
