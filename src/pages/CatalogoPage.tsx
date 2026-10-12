import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StoreShell from '@/components/store/StoreShell';
import ProductCard from '@/components/store/ProductCard';
import ProductModal from '@/components/landing/ProductModal';
import { categoryLabel, hasActiveOffer, useStore } from '@/components/store/useStore';
import { container } from '@/components/store/ui';
import { Icon } from '@/components/icons';
import { type DatabaseProduct } from '@/lib/supabase';

type SortBy = 'recentes' | 'menor_preco' | 'maior_preco';

const sortOptions: { id: SortBy; label: string }[] = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'menor_preco', label: 'Menor preço' },
  { id: 'maior_preco', label: 'Maior preço' },
];

const filterLink = (active: boolean) =>
  `flex items-center justify-between min-h-[44px] px-4 rounded-full text-[15px] transition-colors ${
    active ? 'bg-sinho-ink text-sinho-ivory' : 'text-sinho-dark hover:bg-sinho-soft'
  }`;

export default function CatalogoPage() {
  const { ativos, loading, categories, applied, applyCoupon, clearCoupon, priceOf } = useStore();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<DatabaseProduct | null>(null);
  const [couponInput, setCouponInput] = useState('');

  const q = params.get('q') ?? '';
  const categoria = params.get('categoria');
  const ofertas = params.get('ofertas') === '1';
  const ordemParam = params.get('ordem');
  const sortBy: SortBy = ordemParam === 'menor_preco' || ordemParam === 'maior_preco' ? ordemParam : 'recentes';

  useEffect(() => {
    document.title = 'Catálogo | Sinho Imports';
  }, []);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const offerCount = useMemo(() => ativos.filter(hasActiveOffer).length, [ativos]);

  const filtered = useMemo(() => {
    let list = ativos;
    if (categoria) list = list.filter(p => (p.categoria || 'outros') === categoria);
    if (ofertas) list = list.filter(hasActiveOffer);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(t) || (p.descricao ?? '').toLowerCase().includes(t));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'menor_preco') return priceOf(a) - priceOf(b);
      if (sortBy === 'maior_preco') return priceOf(b) - priceOf(a);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
  }, [ativos, categoria, ofertas, q, sortBy, priceOf]);

  const title = q ? `Busca: “${q}”` : ofertas ? 'Ofertas' : categoria ? categoryLabel(categoria) : 'Toda a coleção';
  const hasFilters = !!(q || categoria || ofertas);

  const submitCoupon = (e: FormEvent) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) setCouponInput('');
  };

  const countFor = (c: string) => ativos.filter(p => (p.categoria || 'outros') === c).length;

  return (
    <StoreShell categories={categories} hasOffers={offerCount > 0}>
      <div className="bg-white border-b border-sinho-card-line">
        <div className={`${container} py-7 sm:py-9`}>
          <nav aria-label="Caminho" className="flex items-center gap-1.5 text-[13px] text-sinho-meta mb-3">
            <Link to="/" className="hover:text-sinho-dark">Início</Link>
            <Icon name="chevron_right" className="w-4 h-4" />
            <Link to="/catalogo" className="hover:text-sinho-dark">Catálogo</Link>
            {hasFilters && (
              <>
                <Icon name="chevron_right" className="w-4 h-4" />
                <span className="text-sinho-dark">{title}</span>
              </>
            )}
          </nav>
          <h1 className="font-display text-3xl sm:text-[42px] leading-tight tracking-[0.06em] uppercase text-sinho-dark">{title}</h1>
        </div>
      </div>

      <div className={`${container} py-8 grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-10`}>
        {/* Filtros */}
        <aside aria-label="Filtros" className="flex flex-col gap-7">
          <div className="hidden lg:flex flex-col gap-1">
            <h2 className="px-4 pb-2 text-xs font-semibold tracking-[0.2em] uppercase text-sinho-meta">Categorias</h2>
            <button type="button" onClick={() => update({ categoria: null })} className={filterLink(!categoria)}>
              Todas <span className="text-sm opacity-70">{ativos.length}</span>
            </button>
            {categories.map(c => (
              <button key={c} type="button" onClick={() => update({ categoria: c })} className={filterLink(categoria === c)} aria-pressed={categoria === c}>
                {categoryLabel(c)} <span className="text-sm opacity-70">{countFor(c)}</span>
              </button>
            ))}
          </div>

          {/* Categorias no celular */}
          <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ id: null as string | null, label: 'Todas' }, ...categories.map(c => ({ id: c, label: categoryLabel(c) }))].map(c => {
              const active = categoria === c.id;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => update({ categoria: c.id })}
                  aria-pressed={active}
                  className={`shrink-0 min-h-[44px] px-5 rounded-full border text-[13px] tracking-[0.1em] uppercase ${active ? 'bg-sinho-ink text-sinho-ivory border-sinho-ink' : 'bg-white border-sinho-card-line text-sinho-dark'}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {offerCount > 0 && (
            <label className="flex items-center justify-between gap-3 min-h-[52px] px-4 rounded-2xl bg-white border border-sinho-card-line cursor-pointer">
              <span className="flex items-center gap-2.5 text-[15px] text-sinho-dark">
                <Icon name="local_offer" className="w-5 h-5 text-sinho-bronze" /> Só ofertas
              </span>
              <input
                type="checkbox"
                checked={ofertas}
                onChange={e => update({ ofertas: e.target.checked ? '1' : null })}
                className="w-5 h-5 accent-[#8C6A2A]"
              />
            </label>
          )}

          <form onSubmit={submitCoupon} className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white border border-sinho-card-line">
            <label htmlFor="cupom" className="text-xs font-semibold tracking-[0.2em] uppercase text-sinho-meta">Cupom de desconto</label>
            {applied ? (
              <div className="flex items-center justify-between gap-2 min-h-[44px] pl-4 pr-1 rounded-full bg-sinho-gold/20 border border-sinho-gold">
                <span className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase"><Icon name="check_circle" className="w-5 h-5 text-sinho-bronze" />{applied.code}</span>
                <button type="button" onClick={clearCoupon} aria-label="Remover cupom" className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-white/60">
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex">
                <input
                  id="cupom"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Digite o código"
                  className="flex-1 min-w-0 h-11 pl-4 rounded-l-full border border-r-0 border-sinho-card-line bg-sinho-cream text-base uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-sinho-dark"
                />
                <button type="submit" className="h-11 px-4 rounded-r-full bg-sinho-ink text-sinho-ivory text-xs tracking-[0.14em] uppercase hover:bg-black">
                  Aplicar
                </button>
              </div>
            )}
          </form>
        </aside>

        {/* Resultados */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-sinho-meta">
              {loading ? 'Carregando...' : `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`}
              {hasFilters && !loading && (
                <button type="button" onClick={() => setParams({}, { replace: true })} className="ml-3 inline-flex items-center gap-1 min-h-[44px] text-sinho-dark underline underline-offset-4">
                  Limpar filtros
                </button>
              )}
            </p>
            <label className="flex items-center gap-2 text-sm text-sinho-meta">
              Ordenar por
              <span className="relative">
                <select
                  value={sortBy}
                  onChange={e => update({ ordem: e.target.value === 'recentes' ? null : e.target.value })}
                  className="appearance-none h-11 pl-4 pr-10 rounded-full bg-white border border-sinho-card-line text-sinho-dark text-[15px] focus:outline-none focus:border-sinho-dark"
                >
                  {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <Icon name="expand_more" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sinho-dark" />
              </span>
            </label>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-sinho-meta">
              <Icon name="progress_activity" className="w-10 h-10 animate-spin" />
              <p>Carregando o catálogo...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 px-6 flex flex-col items-center text-center gap-4 rounded-2xl bg-white border border-sinho-card-line">
              <Icon name="search_off" className="w-12 h-12 text-sinho-chip" />
              <p className="text-lg text-sinho-dark">Nenhum produto encontrado.</p>
              <p className="text-sinho-meta max-w-md">Tente outro termo ou fale com a gente: indicamos o perfume certo pelo WhatsApp.</p>
              <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-2 min-h-[46px] px-6 rounded-full bg-sinho-ink text-sinho-ivory text-[13px] tracking-[0.16em] uppercase">
                Ver todos os produtos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} price={priceOf(p)} onOpen={setSelected} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductModal
        product={selected}
        discountedPrice={selected ? priceOf(selected) : undefined}
        onClose={() => setSelected(null)}
      />
    </StoreShell>
  );
}
