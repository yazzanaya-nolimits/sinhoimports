import { useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockProducts, getWhatsAppLink } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

const PDVPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');

  const filtered = search.length >= 2
    ? mockProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.id.includes(search)
      )
    : [];

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.sellPrice, qty: 1 }];
    });
    setSearch('');
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId === id) {
        const newQty = Math.max(0, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const finalizeSale = () => {
    if (cart.length === 0) {
      toast({ title: 'Adicione itens ao carrinho', variant: 'destructive' });
      return;
    }
    toast({ title: 'Venda registrada com sucesso!', description: `Total: R$ ${total.toFixed(2)}` });
    setCart([]);
    setClientName('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto por nome, marca ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {filtered.length > 0 && (
          <div className="bg-card border border-border rounded-lg divide-y divide-border max-h-60 overflow-auto">
            {filtered.map(p => (
              <button
                key={p.id}
                className="w-full flex items-center gap-4 p-3 hover:bg-secondary/50 transition-colors text-left"
                onClick={() => addToCart(p)}
              >
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · Estoque: {p.stock}</p>
                </div>
                <span className="text-primary font-bold whitespace-nowrap">
                  R$ {p.sellPrice.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Cart items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Itens da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Busque e adicione produtos acima
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.price.toFixed(2)} × {item.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.productId, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">{item.qty}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(item.productId, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => updateQty(item.productId, -item.qty)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap">
                      R$ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nome do cliente (opcional)"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="bg-secondary/30"
              maxLength={100}
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Itens:</span>
              <span>{cart.reduce((s, i) => s + i.qty, 0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-border pt-4">
              <span>Total:</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-gradient-gold text-primary-foreground font-semibold"
              onClick={finalizeSale}
            >
              Finalizar Venda
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Recibo
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDVPage;
