import { WHATSAPP_NUMBER } from '@/data/products';
import { Icon } from './Icon';
import { container, eyebrow, sectionTitle } from './styles';

const brands = ['Lattafa', 'Al Haramain', 'Isabelle La Belle'];

const families = [
  { icon: 'forest', name: 'Amadeirado', desc: 'Oud, sândalo e resinas. Presença séria, ideal para noite e frio.' },
  { icon: 'cookie', name: 'Doce', desc: 'Baunilha, âmbar e caramelo. Os que mais rendem elogio na rua.' },
  { icon: 'local_florist', name: 'Floral', desc: 'Rosa, jasmim e almíscar. Elegante e fácil de usar de dia.' },
  { icon: 'local_fire_department', name: 'Especiado', desc: 'Canela, açafrão e pimenta. Quente, marcante e diferente.' },
];

const waLink = (family: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá! Gosto de perfumes com aroma ${family.toLowerCase()}. Quais vocês me indicam?`,
  )}`;

export const BrandsStrip = () => (
  <section aria-label="Marcas" className="bg-sinho-ink border-y border-sinho-line">
    <ul className={`${container} py-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-display text-base sm:text-xl tracking-[0.28em] uppercase text-sinho-faint`}>
      {brands.map((b, i) => (
        <li key={b} className="flex items-center gap-10">
          {i > 0 && <span className="text-sinho-gold text-xs" aria-hidden="true">◆</span>}
          {b}
        </li>
      ))}
    </ul>
  </section>
);

const AromasSection = () => (
  <section id="aromas" className="bg-sinho-ink scroll-mt-20">
    <div className={`${container} py-20 sm:py-24 flex flex-col gap-12`}>
      <div className="flex flex-col items-center text-center gap-3.5">
        <span className={`${eyebrow} text-sinho-gold`}>Primeira compra?</span>
        <h2 className={`${sectionTitle} text-sinho-ivory`}>Escolha pelo aroma</h2>
        <p className="max-w-[560px] text-base sm:text-lg font-light leading-relaxed text-sinho-text">
          Comece pela família que você já gosta. Toque em uma e a gente indica os perfumes certos no WhatsApp.
        </p>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-sinho-line border border-sinho-line">
        {families.map(f => (
          <li key={f.name} className="bg-sinho-ink">
            <a
              href={waLink(f.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="group h-full flex flex-col gap-4 p-7 sm:p-9 text-sinho-ivory hover:bg-sinho-panel transition-colors"
            >
              <Icon name={f.icon} className="w-9 h-9 text-sinho-gold" />
              <span className="font-display text-xl sm:text-2xl tracking-[0.08em] uppercase">{f.name}</span>
              <span className="text-sm leading-relaxed text-sinho-muted">{f.desc}</span>
              <span className="mt-auto pt-2 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-sinho-gold">
                Pedir indicação
                <Icon name="arrow_forward" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default AromasSection;
