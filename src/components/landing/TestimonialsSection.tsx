import { INSTAGRAM_URL } from '@/data/products';
import { Icon } from './Icon';
import { btnOutline, container, eyebrow, sectionTitle } from './styles';

// Use apenas depoimentos reais. O ideal é trocar por prints de conversa ou fotos de clientes.
const testimonials = [
  {
    name: 'Lucas M.',
    product: 'Raghba · Lattafa',
    text: 'Perfume Raghba da Lattafa é simplesmente incrível! Fixação absurda e preço justo. Recomendo a Sinho Imports!',
  },
  {
    name: 'Ana Paula S.',
    product: 'Invicta Pro Diver',
    text: 'Comprei um Invicta Pro Diver e chegou super rápido. Produto original, embalagem perfeita. Voltarei a comprar!',
  },
];

const TestimonialsSection = () => (
  <section className="bg-sinho-panel border-y border-sinho-line">
    <div className={`${container} py-20 sm:py-24 flex flex-col gap-12`}>
      <div className="flex flex-col items-center text-center gap-3.5">
        <span className={`${eyebrow} text-sinho-gold`}>Clientes</span>
        <h2 className={`${sectionTitle} text-sinho-ivory`}>Quem já recebeu</h2>
      </div>

      <ul className="grid md:grid-cols-2 gap-6 max-w-5xl w-full mx-auto">
        {testimonials.map(t => (
          <li key={t.name}>
            <figure className="h-full flex flex-col gap-6 p-8 sm:p-10 bg-sinho-ink border border-sinho-line">
              <div className="flex gap-0.5 text-sinho-gold" role="img" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Icon key={j} name="star" filled className="w-5 h-5" />
                ))}
              </div>
              <blockquote className="font-display text-xl sm:text-2xl leading-snug text-sinho-ivory">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-auto flex flex-col gap-1">
                <span className="text-sm font-medium tracking-[0.14em] uppercase text-sinho-ivory">{t.name}</span>
                <span className="text-xs tracking-[0.14em] uppercase text-sinho-faint">{t.product}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={btnOutline}>
          <Icon name="photo_camera" className="w-5 h-5" />
          Ver mais no @sinhoimports
        </a>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
