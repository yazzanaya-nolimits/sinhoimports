import { useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts, CATEGORIES, getWhatsAppLink } from '@/data/products';

type Category = keyof typeof CATEGORIES | 'all';

const ProductsSection = () => {
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter(p => {
    const matchCat = category === 'all' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto ou marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              size="sm"
              variant={category === 'all' ? 'default' : 'outline'}
              onClick={() => setCategory('all')}
              className={category === 'all' ? 'bg-gradient-gold text-primary-foreground' : 'border-primary/30'}
            >
              Todos
            </Button>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={category === key ? 'default' : 'outline'}
                onClick={() => setCategory(key as Category)}
                className={category === key ? 'bg-gradient-gold text-primary-foreground' : 'border-primary/30'}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-gold transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-gold text-primary-foreground"
                    asChild
                  >
                    <a href={getWhatsAppLink(product.name)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Comprar via WhatsApp
                    </a>
                  </Button>
                </div>
                {product.featured && (
                  <span className="absolute top-3 right-3 bg-gradient-gold text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Destaque
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-primary/70 tracking-wider uppercase">{product.brand}</p>
                <h3 className="font-serif font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-primary">
                    R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Button size="sm" variant="ghost" className="text-primary" asChild>
                    <a href={getWhatsAppLink(product.name)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
