import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { formatBRL } from '@/lib/brl';
import { CATEGORIES, getWhatsAppLink } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import ProductModal from './ProductModal';
import { type DatabaseProduct } from '@/lib/supabase';
import { Icon } from './Icon';
import { btnOutlineDark, container, eyebrow, sectionTitle } from './styles';

const categoryLabel = (c: string) =>
  (CATEGORIES as Record<string, string>)[c] ?? c.charAt(0).toUpperCase() + c.slice(1);

const chipBase =
  'inline-flex items-center min-h-[44px] px-5 border font-body text-xs tracking-[0.16em] uppercase transition-colors';

const ProductsSection = () => {
  const { products, loading } = useSupabaseProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentual' | 'fixo' } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const { toast } = useToast();

  const ativos = useMemo(() => products.filter(p => p.status === 'ativo'), [products]);

  const categories = useMemo(
    () => Array.from(new Set(ativos.map(p => p.categoria).filter(Boolean))),
    [ativos],
  );

  // Destaques: prioriza marcados como destaque; no máximo 8, mais recentes primeiro
  const destaques = useMemo(() => {
    const comDestaque = ativos.filter(p => p.destaque);
    const base = comDestaque.length > 0 ? comDestaque : ativos;
    return [...base]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [ativos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term) return ativos.filter(p => p.nome.toLowerCase().includes(term));
    if (category) return ativos.filter(p => p.categoria === category);
    return destaques;
  }, [search, category, ativos, destaques]);

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const now = new Date();
    const productWithCoupon = products.find(
      p =>
        p.cupom_codigo?.toUpperCase() === couponCode.toUpperCase() &&
        (!p.cupom_validade || new Date(p.cupom_validade) >= now),
    );

    if (productWithCoupon) {
      setAppliedCoupon({
        code: productWithCoupon.cupom_codigo!,
        discount: productWithCoupon.cupom_valor || 0,
        type: productWithCoupon.cupom_tipo as 'percentual' | 'fixo',
      });
      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de ${
          productWithCoupon.cupom_tipo === 'percentual'
            ? productWithCoupon.cupom_valor + '%'
            : formatBRL(productWithCoupon.cupom_valor || 0)
        }`,
      });
    } else {
      const expiredProduct = products.find(p => p.cupom_codigo?.toUpperCase() === couponCode.toUpperCase());
      toast({ title: expiredProduct ? 'Cupom expirado' : 'Cupom inválido', variant: 'destructive' });
    }
  };

  const calculateDiscountedPrice = (price: number, productCouponCode: string | null) => {
    if (!appliedCoupon || appliedCoupon.code !== productCouponCode) return price;
    if (appliedCoupon.type === 'percentual') return price * (1 - appliedCoupon.discount / 100);
    return Math.max(0, price - appliedCoupon.discount);
  };

  return (
    <section id="produtos" className="bg-sinho-ivory text-sinho-dark scroll-mt-20">
      <div className={`${container} py-20 sm:py-24 flex flex-col gap-10`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3.5">
            <span className={`${eyebrow} text-sinho-brown`}>Mais vendidos</span>
            <h2 className={sectionTitle}>Os favoritos da casa</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <label className="relative flex-1 sm:w-64">
              <span className="sr-only">Buscar produto</span>
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-sinho-paper-text" />
              <input
                type="search"
                placeholder="Buscar perfume"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-sinho-paper border border-sinho-sand-line text-sinho-dark placeholder:text-sinho-paper-text focus:outline-none focus:border-sinho-dark"
              />
            </label>
            <div className="flex">
              <label className="flex-1 sm:w-44">
                <span className="sr-only">Cupom de desconto</span>
                <input
                  placeholder="Cupom"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  className="w-full h-12 px-4 bg-sinho-paper border border-r-0 border-sinho-sand-line text-sinho-dark placeholder:text-sinho-paper-text uppercase tracking-wider focus:outline-none focus:border-sinho-dark"
                />
              </label>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-12 px-5 bg-sinho-dark text-sinho-ivory text-xs tracking-[0.16em] uppercase hover:bg-black transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {(categories.length > 1 || appliedCoupon) && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 1 && (
              <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={!category}
                  onClick={() => setCategory(null)}
                  className={`${chipBase} ${!category ? 'bg-sinho-dark text-sinho-ivory border-sinho-dark' : 'border-sinho-chip text-sinho-dark hover:border-sinho-dark'}`}
                >
                  Destaques
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`${chipBase} ${category === c ? 'bg-sinho-dark text-sinho-ivory border-sinho-dark' : 'border-sinho-chip text-sinho-dark hover:border-sinho-dark'}`}
                  >
                    {categoryLabel(c)}
                  </button>
                ))}
              </div>
            )}
            {appliedCoupon && (
              <span className="inline-flex items-center gap-2 min-h-[44px] pl-4 pr-1 bg-sinho-gold/20 border border-sinho-gold text-sm tracking-wider uppercase">
                <Icon name="sell" className="w-4 h-4" />
                {appliedCoupon.code}
                <button
                  type="button"
                  aria-label="Remover cupom"
                  className="w-10 h-10 inline-flex items-center justify-center"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-sinho-paper-text">
            <Icon name="progress_activity" className="w-10 h-10 animate-spin" />
            <p>Carregando perfumes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map(product => {
              const discountedPrice = calculateDiscountedPrice(product.valor, product.cupom_codigo);
              const hasDiscount = discountedPrice < product.valor;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col bg-sinho-paper border border-sinho-sand-line hover:border-sinho-chip transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="relative block aspect-square overflow-hidden bg-sinho-sand text-left"
                    aria-label={`Ver detalhes de ${product.nome}`}
                  >
                    {product.foto_url ? (
                      <img
                        src={product.foto_url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-sinho-chip">
                        <Icon name="image" className="w-10 h-10" />
                      </span>
                    )}
                    {product.cupom_codigo && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-sinho-dark text-sinho-ivory text-[11px] tracking-[0.14em] uppercase">
                        {product.cupom_tipo === 'percentual'
                          ? `${product.cupom_valor}% off`
                          : `${formatBRL(product.cupom_valor || 0)} off`}
                      </span>
                    )}
                  </button>

                  <div className="flex flex-col gap-2 p-3.5 sm:p-5 flex-grow">
                    {product.categoria && (
                      <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-sinho-brown">
                        {categoryLabel(product.categoria)}
                      </span>
                    )}
                    <h3 className="font-display text-base sm:text-xl leading-snug tracking-[0.03em] line-clamp-2">
                      {product.nome}
                    </h3>
                    {product.descricao && (
                      <p className="hidden sm:block text-sm leading-relaxed text-sinho-paper-text line-clamp-2">
                        {product.descricao}
                      </p>
                    )}

                    <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-xs text-sinho-paper-text line-through">{formatBRL(product.valor)}</span>
                        )}
                        <span className="text-base sm:text-xl font-medium">{formatBRL(discountedPrice)}</span>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={getWhatsAppLink(product.nome)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Perguntar sobre ${product.nome} no WhatsApp`}
                          className="hidden sm:inline-flex w-11 h-11 items-center justify-center border border-sinho-sand-line text-sinho-dark hover:border-sinho-dark transition-colors"
                        >
                          <Icon name="forum" className="w-5 h-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          aria-label={`Comprar ${product.nome}`}
                          className="inline-flex w-11 h-11 items-center justify-center bg-sinho-dark text-sinho-ivory hover:bg-black transition-colors"
                        >
                          <Icon name="shopping_bag" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-sinho-paper-text py-12">Nenhum produto encontrado.</p>
        )}

        {!loading && ativos.length > filtered.length && (
          <div className="flex justify-center">
            <Link to="/catalogo" className={btnOutlineDark}>
              Ver todos os {ativos.length} produtos
              <Icon name="arrow_forward" className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        discountedPrice={
          selectedProduct ? calculateDiscountedPrice(selectedProduct.valor, selectedProduct.cupom_codigo) : undefined
        }
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};

export default ProductsSection;
