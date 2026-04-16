import { useState } from 'react';
import { Plus, Download, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProducts, BRANDS, CATEGORIES, type Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', brand: BRANDS[0], category: 'perfume' as Product['category'],
    buyPrice: '', sellPrice: '', stock: '', image: '', description: '',
  });

  const resetForm = () => {
    setForm({ name: '', brand: BRANDS[0], category: 'perfume', buyPrice: '', sellPrice: '', stock: '', image: '', description: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.name || !form.buyPrice || !form.sellPrice) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }
    const product: Product = {
      id: editId || String(Date.now()),
      name: form.name,
      brand: form.brand,
      category: form.category,
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      stock: Number(form.stock) || 0,
      image: form.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
      description: form.description,
    };

    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? product : p));
      toast({ title: 'Produto atualizado!' });
    } else {
      setProducts(prev => [...prev, product]);
      toast({ title: 'Produto adicionado!' });
    }
    resetForm();
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, category: p.category,
      buyPrice: String(p.buyPrice), sellPrice: String(p.sellPrice),
      stock: String(p.stock), image: p.image, description: p.description,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const exportCSV = () => {
    const headers = 'Nome,Marca,Categoria,Compra,Venda,Estoque,Lucro,% Ganho\n';
    const rows = products.map(p => {
      const lucro = p.sellPrice - p.buyPrice;
      const ganho = ((lucro / p.buyPrice) * 100).toFixed(1);
      return `${p.name},${p.brand},${CATEGORIES[p.category]},${p.buyPrice},${p.sellPrice},${p.stock},${lucro.toFixed(2)},${ganho}%`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos_sinho.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Cadastro de Produtos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif flex justify-between">
              {editId ? 'Editar Produto' : 'Novo Produto'}
              <Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input placeholder="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
              <Select value={form.brand} onValueChange={v => setForm(f => ({ ...f, brand: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as Product['category'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Valor Compra *" type="number" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))} />
              <Input placeholder="Valor Venda *" type="number" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))} />
              <Input placeholder="Estoque" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              <Input placeholder="URL da Foto" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="sm:col-span-2" maxLength={500} />
              <Input placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="lg:col-span-3" maxLength={300} />
            </div>
            {form.buyPrice && form.sellPrice && (
              <div className="mt-4 flex gap-6 text-sm">
                <span>Lucro: <strong className="text-primary">R$ {(Number(form.sellPrice) - Number(form.buyPrice)).toFixed(2)}</strong></span>
                <span>Ganho: <strong className="text-primary">{(((Number(form.sellPrice) - Number(form.buyPrice)) / Number(form.buyPrice)) * 100).toFixed(1)}%</strong></span>
              </div>
            )}
            <Button className="mt-4 bg-gradient-gold text-primary-foreground" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Compra</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">% Ganho</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => {
                  const lucro = p.sellPrice - p.buyPrice;
                  const ganho = ((lucro / p.buyPrice) * 100).toFixed(1);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.brand}</TableCell>
                      <TableCell>{CATEGORIES[p.category]}</TableCell>
                      <TableCell className="text-right">R$ {p.buyPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">R$ {p.sellPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-primary">R$ {lucro.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-primary">{ganho}%</TableCell>
                      <TableCell className="text-right">{p.stock}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => startEdit(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
