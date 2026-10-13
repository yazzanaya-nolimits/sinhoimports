import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { type DatabaseProduct } from '@/lib/supabase';
import { Icon } from '@/components/icons';
import ProductCard from './ProductCard';
import { container, roundIconBtn, sectionTitle } from './ui';

type Props = {
  id?: string;
  title: string;
  products: DatabaseProduct[];
  priceOf: (p: DatabaseProduct) => number;
  onOpen: (p: DatabaseProduct) => void;
  seeAllHref?: string;
  aside?: ReactNode;
};

/** Vitrine horizontal com setas, no estilo de loja de varejo. */
const ProductRail = ({ id, title, products, priceOf, onOpen, seeAllHref, aside }: Props) => {
  const track = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section id={id} aria-label={title} className={`${container} py-10 sm:py-14 scroll-mt-28`}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className={sectionTitle}>{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Link to={seeAllHref} className="hidden sm:inline-flex items-center gap-1 min-h-[44px] px-3 text-[13px] tracking-[0.14em] uppercase text-sinho-dark hover:text-sinho-bronze">
              Ver todos <Icon name="chevron_right" className="w-5 h-5" />
            </Link>
          )}
          {products.length > 2 && (
            <>
              <button type="button" onClick={() => scroll(-1)} aria-label={`Anteriores em ${title}`} className={roundIconBtn}>
                <Icon name="chevron_left" className="w-6 h-6" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label={`Próximos em ${title}`} className={roundIconBtn}>
                <Icon name="chevron_right" className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={aside ? 'grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-4 sm:gap-5' : ''}>
        {aside}
        <div
          ref={track}
          className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              price={priceOf(p)}
              onOpen={onOpen}
              className="snap-start shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRail;
