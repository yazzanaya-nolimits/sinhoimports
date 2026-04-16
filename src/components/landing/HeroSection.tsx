import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProducts, getWhatsAppLink } from '@/data/products';

const featured = mockProducts.filter(p => p.featured);

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % featured.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const product = featured[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      <div className="absolute inset-0 opacity-20">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="text-xs tracking-[0.3em] uppercase text-primary/80 border border-primary/30 px-4 py-1.5 rounded-full">
                Importação Premium
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
              Luxo Original
              <br />
              <span className="text-gradient-gold">para Todo Brasil</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Perfumes árabes originais, relógios de luxo e acessórios premium. 
              Qualidade garantida com envio para todo o país.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-gold text-primary-foreground font-semibold px-8 hover:opacity-90 transition-opacity"
                onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Produtos
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
                asChild
              >
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-96 h-96 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-10 blur-3xl" />
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl shadow-gold transition-all duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <p className="font-serif font-semibold text-lg">{product.name}</p>
                <p className="text-primary font-bold">
                  R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'w-8 bg-primary' : 'bg-muted-foreground/40'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrent(i => (i - 1 + featured.length) % featured.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent(i => (i + 1) % featured.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
