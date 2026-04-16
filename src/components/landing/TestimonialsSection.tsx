import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Lucas M.',
    text: 'Perfume Raghba da Lattafa é simplesmente incrível! Fixação absurda e preço justo. Recomendo a Sinho Imports!',
    rating: 5,
  },
  {
    name: 'Ana Paula S.',
    text: 'Comprei um Invicta Pro Diver e chegou super rápido. Produto original, embalagem perfeita. Voltarei a comprar!',
    rating: 5,
  },
  {
    name: 'Rafael C.',
    text: 'A central multimídia Pioneer que comprei ficou perfeita no meu carro. Atendimento via WhatsApp muito atencioso.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            O que Dizem <span className="text-gradient-gold">Nossos Clientes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{t.text}"</p>
              <p className="font-serif font-semibold text-primary">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Instagram Embed Placeholder */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-2xl font-serif font-semibold">
            Siga no <span className="text-gradient-gold">Instagram</span>
          </h3>
          <a
            href="https://www.instagram.com/sinhoimports/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            @sinhoimports →
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
