import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StoreShell from '@/components/store/StoreShell';
import HomeBanner from '@/components/store/HomeBanner';
import ProductRail from '@/components/store/ProductRail';
import StoreFaq from '@/components/store/StoreFaq';
import ProductModal from '@/components/landing/ProductModal';
import { categoryLabel, hasActiveOffer, useStore } from '@/components/store/useStore';
import { btnGold, container, sectionTitle } from '@/components/store/ui';
import { Icon } from '@/components/icons';
import { WHATSAPP_NUMBER } from '@/data/products';
import { type DatabaseProduct } from '@/lib/supabase';

const finderLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Olá! Quero ajuda para escolher um perfume. Hoje eu uso: ',
)}`;

const brands = ['Lattafa', 'Al Haramain', 'Isabelle La Belle', 'Invicta', 'Bulgari'];

const Index = () => {
  const { ativos, loading, categories, priceOf } = useStore();
  const [selected, setSelected] = useState<DatabaseProduct | null>(null);

  const offers = useMemo(() => ativos.filter(hasActiveOffer), [ativos]);
  const featured = useMemo(() => {
    const d = ativos.filter(p => p.destaque);
    return (d.length ? d : ativos).slice(0, 12);
  }, [ativos]);
  const recent = useMemo(
    () => [...ativos].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 12),
    [ativos],
  );
  const categoryRails = useMemo(
    () =>
      categories
        .map(c => ({ c, items: ativos.filter(p => (p.categoria || 'outros') === c) }))
        .filter(r => r.items.length >= 3)
        .slice(0, 3),
    [categories, ativos],
  );

  const couponCode = offers.find(p => p.destaque)?.cupom_codigo ?? offers[0]?.cupom_codigo ?? null;

  const shortcuts = [
    ...(offers.length ? [{ icon: 'local_offer', label: 'Ofertas', to: '/catalogo?ofertas=1', gold: true }] : []),
    { icon: 'trending_up', label: 'Destaques', to: '/#destaques' },
    { icon: 'auto_awesome', label: 'Novidades', to: '/catalogo?ordem=novidades' },
    { icon: 'tune', label: 'Encontrar meu perfume', href: finderLink },
    ...categories.slice(0, 2).map(c => ({ icon: 'spa', label: categoryLabel(c), to: `/catalogo?categoria=${encodeURIComponent(c)}` })),
  ].slice(0, 6);

  return (
    <StoreShell categories={categories} hasOffers={offers.length > 0}>
      <HomeBanner couponCode={couponCode} />

      {/* Atalhos */}
      <nav aria-label="Atalhos" className={`${container} pt-6 pb-4`}>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4">
          {shortcuts.map(s => {
            const inner = (
              <>
                <span className={`shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full inline-flex items-center justify-center ${s.gold ? 'bg-sinho-gold text-sinho-ink' : 'bg-sinho-ink text-sinho-gold'}`}>
                  <Icon name={s.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
                </span>
                <span className="text-[13px] sm:text-sm font-medium tracking-[0.08em] uppercase leading-snug text-sinho-dark">{s.label}</span>
              </>
            );
            const cls = 'flex items-center gap-3 min-h-[60px] group';
            return (
              <li key={s.label}>
                {'href' in s && s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link to={(s as { to: string }).to} className={cls}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {loading ? (
        <div className={`${container} py-20 flex flex-col items-center gap-4 text-sinho-meta`}>
          <Icon name="progress_activity" className="w-10 h-10 animate-spin" />
          <p>Carregando a loja...</p>
        </div>
      ) : (
        <>
          <ProductRail id="destaques" title="Destaques" products={featured} priceOf={priceOf} onOpen={setSelected} seeAllHref="/catalogo" />
          <ProductRail id="ofertas" title="Ofertas" products={offers} priceOf={priceOf} onOpen={setSelected} seeAllHref="/catalogo?ofertas=1" />

          {categoryRails[0] && (
            <ProductRail
              title={categoryLabel(categoryRails[0].c)}
              products={categoryRails[0].items.slice(0, 9)}
              priceOf={priceOf}
              onOpen={setSelected}
              seeAllHref={`/catalogo?categoria=${encodeURIComponent(categoryRails[0].c)}`}
              aside={
                <Link
                  to={`/catalogo?categoria=${encodeURIComponent(categoryRails[0].c)}`}
                  className="hidden lg:flex flex-col justify-end min-h-[460px] rounded-2xl overflow-hidden bg-sinho-ink text-sinho-ivory relative group"
                >
                  {categoryRails[0].items[0]?.foto_url && (
                    <img src={categoryRails[0].items[0].foto_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" loading="lazy" />
                  )}
                  <span className="relative p-7 border-t-2 border-sinho-gold bg-sinho-ink/90 flex flex-col gap-2">
                    <span className="text-xs tracking-[0.22em] uppercase text-sinho-gold">Coleção</span>
                    <span className="font-display text-3xl tracking-[0.06em] uppercase">{categoryLabel(categoryRails[0].c)}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-sinho-text">Ver a coleção <Icon name="arrow_forward" className="w-4 h-4" /></span>
                  </span>
                </Link>
              }
            />
          )}

          <ProductRail title="Novidades" products={recent} priceOf={priceOf} onOpen={setSelected} seeAllHref="/catalogo?ordem=novidades" />

          {categoryRails.slice(1).map(r => (
            <ProductRail
              key={r.c}
              title={categoryLabel(r.c)}
              products={r.items.slice(0, 12)}
              priceOf={priceOf}
              onOpen={setSelected}
              seeAllHref={`/catalogo?categoria=${encodeURIComponent(r.c)}`}
            />
          ))}
        </>
      )}

      {/* Marcas */}
      <section id="marcas" aria-label="Marcas" className="bg-sinho-ivory border-y border-sinho-sand-line mt-6">
        <div className={`${container} py-12 sm:py-14`}>
          <h2 className={`${sectionTitle} mb-7`}>Marcas da casa</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {brands.map(b => (
              <li key={b}>
                <Link
                  to={`/catalogo?q=${encodeURIComponent(b)}`}
                  className="h-24 sm:h-28 px-4 flex items-center justify-center text-center rounded-2xl bg-white border border-sinho-sand-line font-display text-base sm:text-xl tracking-[0.2em] uppercase text-sinho-dark hover:border-sinho-dark transition-colors"
                >
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Atendimento */}
      <section aria-label="Atendimento" className={`${container} py-12 sm:py-16`}>
        <div className="rounded-3xl bg-sinho-ink text-sinho-ivory px-6 sm:px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-7">
          <div className="flex items-center gap-5">
            <span className="shrink-0 w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full bg-sinho-gold text-sinho-ink inline-flex items-center justify-center">
              <Icon name="forum" className="w-8 h-8" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase">Não sabe qual escolher?</h2>
              <p className="text-base font-light text-sinho-text">Diga o perfume que você usa hoje e indicamos o árabe mais parecido.</p>
            </div>
          </div>
          <a href={finderLink} target="_blank" rel="noopener noreferrer" className={`${btnGold} shrink-0`}>
            Falar no WhatsApp
          </a>
        </div>
      </section>

      <StoreFaq />

      <ProductModal
        product={selected}
        discountedPrice={selected ? priceOf(selected) : undefined}
        onClose={() => setSelected(null)}
      />
    </StoreShell>
  );
};

export default Index;
