import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, MessageCircle, Search, LayoutGrid, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { formatBRL } from '@/lib/brl';
import { getWhatsAppLink } from '@/data/products';
import ProductModal from '@/components/landing/ProductModal';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import PromoBanner from '@/components/landing/PromoBanner';
import { type DatabaseProduct } from '@/lib/supabase';

const CATEGORIAS = [
  { id: 'todos', label: 'Todos', icon: '📦' },
  { id: 'masculino', label: 'Masculino', icon: '👨' },
  { id: 'feminino', label: 'Feminino', icon: '👩' },
  { id: 'perfumes', label: 'Perfumes', icon: '🌸' },
  { id: 'automotivo', label: 'Automotivo', icon: '🚗' },
  { id: 'unisex', label: 'Unisex', icon: '🤝' },
  { id: 'outros', label: 'Outros', icon: '📦' },
] as const;

type CatId = typeof CATEGORIAS[number]['id'];
type SortBy = 'recentes' | 'menor_preco' | 'maior_preco';

export default function CatalogoPage() {
  const { products, loading } = useSupabaseProducts();
  const [categoria, setCategoria] = useState<CatId>('todos');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recentes');
  const [selected, setSelected] = useState<DatabaseProduct | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Catálogo | Sinho Imports';
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.status === 'ativo');
    if (categoria !== 'todos') {
      list = list.filter(p => (p.categoria || 'outros') === categoria);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'menor_preco') return a.valor - b.valor;
      if (sortBy === 'maior_preco') return b.valor - a.valor;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [products, categoria, search, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" />
      <PromoBanner />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 border border-primary/40 px-4 py-1.5 rounded-full bg-background/40 backdrop-blur-sm">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-[0.3em] uppercase text-primary/90">Catálogo Completo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            Toda a coleção <span className="text-gradient-gold">Sinho Imports</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Filtre por categoria, busque pelo nome e ordene como preferir.
          </p>
        </div>

        {/* Filtros por categoria */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {CATEGORIAS.map(c => {
            const active = categoria === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoria(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  active
                    ? 'bg-gradient-gold text-primary-foreground border-primary shadow-gold'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className="mr-1.5">{c.icon}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Busca + ordenação */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto pelo nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor_preco">Menor preço</SelectItem>
              <SelectItem value="maior_preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
            <p className="text-muted-foreground mt-4">Carregando catálogo...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setCategoria('todos'); setSearch(''); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                onClick={() => setSelected(product)}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-gold transition-all duration-300 flex flex-col cursor-pointer"
                style={{ animationDelay: `${i * 40}ms` }}
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
                      onClick={(e) => { e.stopPropagation(); setSelected(product); }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Comprar Agora
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-white hover:bg-white/10"
                      onClick={(e) => { e.stopPropagation(); setSelected(product); }}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                  {product.cupom_codigo && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold shadow-lg">
                      {product.cupom_tipo === 'percentual'
                        ? `${product.cupom_valor}% OFF`
                        : `${formatBRL(product.cupom_valor || 0)} OFF`}
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-2 flex-grow flex flex-col">
                  <h3 className="font-serif font-semibold text-lg line-clamp-1">{product.nome}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{product.descricao}</p>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{formatBRL(product.valor)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10"
                      asChild
                      onClick={e => e.stopPropagation()}
                    >
                      <a href={getWhatsAppLink(product.nome)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Voltar para a página inicial
          </Button>
        </div>
      </main>

      <Footer />

      <ProductModal 
        product={selected} 
        onClose={() => setSelected(null)} 
        discountedPrice={selected?.valor} 
      />
    </div>
  );
}
