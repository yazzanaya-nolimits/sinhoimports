import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Tag, Loader2, X, LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { formatBRL } from '@/lib/brl';
import { getWhatsAppLink } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import ProductModal from './ProductModal';
import { type DatabaseProduct } from '@/lib/supabase';

const ProductsSection = () => {
  const { products, loading } = useSupabaseProducts();
  const [search, setSearch] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentual' | 'fixo' } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null);
  const { toast } = useToast();

  const ativos = products.filter(p => p.status === 'ativo');

  // Destaques: prioriza marcados como destaque; se houver mais de 6, pega os 6 mais recentes
  const destaques = useMemo(() => {
    const comDestaque = ativos.filter(p => p.destaque);
    const base = comDestaque.length > 0 ? comDestaque : ativos;
    return [...base]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }, [ativos]);

  const filtered = (search
    ? ativos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
    : destaques
  );

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    
    // Check if any product has this coupon code and it's valid
    const now = new Date();
    const productWithCoupon = products.find(p => 
      p.cupom_codigo?.toUpperCase() === couponCode.toUpperCase() && 
      (!p.cupom_validade || new Date(p.cupom_validade) >= now)
    );

    if (productWithCoupon) {
      setAppliedCoupon({
        code: productWithCoupon.cupom_codigo!,
        discount: productWithCoupon.cupom_valor || 0,
        type: productWithCoupon.cupom_tipo as 'percentual' | 'fixo'
      });
      toast({ title: 'Cupom aplicado!', description: `Desconto de ${productWithCoupon.cupom_tipo === 'percentual' ? productWithCoupon.cupom_valor + '%' : formatBRL(productWithCoupon.cupom_valor || 0)}` });
    } else {
      // Check if code exists but expired
      const expiredProduct = products.find(p => p.cupom_codigo?.toUpperCase() === couponCode.toUpperCase());
      if (expiredProduct) {
        toast({ title: 'Cupom expirado', variant: 'destructive' });
      } else {
        toast({ title: 'Cupom inválido', variant: 'destructive' });
      }
    }
  };

  const calculateDiscountedPrice = (price: number, productCouponCode: string | null) => {
    if (!appliedCoupon || appliedCoupon.code !== productCouponCode) return price;
    
    if (appliedCoupon.type === 'percentual') {
      return price * (1 - appliedCoupon.discount / 100);
    } else {
      return Math.max(0, price - appliedCoupon.discount);
    }
  };

  return (
    <section id="produtos" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Nossos <span className="text-gradient-gold">Produtos</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore nossa coleção exclusiva de produtos importados originais
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <div className="flex gap-2 w-full max-w-xs">
            <Input 
              placeholder="Cupom de desconto" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              className="bg-card"
            />
            <Button variant="outline" onClick={handleApplyCoupon}>Aplicar</Button>
          </div>
          
          {appliedCoupon && (
            <Badge variant="secondary" className="flex gap-2 py-1 px-3">
              <Tag className="w-3 h-3" />
              {appliedCoupon.code}
              <X className="w-3 h-3 cursor-pointer" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} />
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
            <p className="text-muted-foreground mt-4">Carregando catálogo premium...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => {
              const discountedPrice = calculateDiscountedPrice(product.valor, product.cupom_codigo);
              const hasDiscount = discountedPrice < product.valor;
              
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-gold transition-all duration-300 flex flex-col cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={product.foto_url || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'}
                      alt={product.nome}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-4 gap-2">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-gold text-primary-foreground font-bold"
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Comprar Agora
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                    
                    {product.cupom_codigo && (
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <Badge className="bg-primary text-primary-foreground font-bold shadow-lg">
                          {product.cupom_tipo === 'percentual' ? `${product.cupom_valor}% OFF` : `${formatBRL(product.cupom_valor || 0)} OFF`}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 space-y-2 flex-grow flex flex-col">
                    <h3 className="font-serif font-semibold text-lg line-clamp-1">{product.nome}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{product.descricao}</p>
                    
                    <div className="pt-4 space-y-1">
                      {hasDiscount && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatBRL(product.valor)}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold ${hasDiscount ? 'text-green-500' : 'text-primary'}`}>
                          {formatBRL(discountedPrice)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={getWhatsAppLink(product.nome)} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum produto ativo encontrado.</p>
        )}

        {!loading && !search && ativos.length > destaques.length && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/catalogo"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-dashed border-primary/50 bg-card hover:bg-primary/5 hover:border-primary transition-all"
            >
              <LayoutGrid className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-serif font-semibold text-lg text-gradient-gold">Ver catálogo completo</p>
                <p className="text-xs text-muted-foreground">
                  Explore todos os {ativos.length} produtos disponíveis
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        discountedPrice={
          selectedProduct
            ? calculateDiscountedPrice(selectedProduct.valor, selectedProduct.cupom_codigo)
            : undefined
        }
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};

export default ProductsSection;
