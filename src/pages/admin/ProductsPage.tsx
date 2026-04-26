import { useState, useRef, useEffect } from 'react';
import { Plus, Download, Edit2, Save, X, Upload, Search, Filter, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BRANDS, CATEGORIES, type Product } from '@/data/products';
import { formatBRL } from '@/lib/brl';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { type DatabaseProduct } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

const ProductsPage = () => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const { products: dbProducts, saveProduct, deleteProduct, toggleStatus, uploadFile, loading } = useSupabaseProducts();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    valor: '',
    foto_url: '',
    imagem_destaque_url: '',
    cupom_codigo: '',
    cupom_tipo: 'percentual' as 'percentual' | 'fixo',
    cupom_valor: '',
    cupom_validade: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  const resetForm = () => {
    setForm({
      nome: '',
      descricao: '',
      valor: '',
      foto_url: '',
      imagem_destaque_url: '',
      cupom_codigo: '',
      cupom_tipo: 'percentual',
      cupom_valor: '',
      cupom_validade: '',
      status: 'ativo'
    });
    setShowForm(false);
    setEditId(null);
  };

  const resetForm = () => {
    setForm({ name: '', brand: BRANDS[0], category: 'perfume', buyPrice: '', sellPrice: '', stock: '', image: '', description: '', sku: '' });
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
      sku: generateSKU(p.category, p.brand),
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const openNewForm = () => {
    resetForm();
    const sku = generateSKU('perfume', BRANDS[0]);
    setForm(f => ({ ...f, sku }));
    setShowForm(true);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1).filter(l => l.trim());
      let count = 0;
      const newProducts: Product[] = lines.map(line => {
        const cols = line.split(',').map(c => c.trim());
        count++;
        return {
          id: String(Date.now() + count),
          name: cols[0] || 'Produto',
          brand: cols[1] || BRANDS[0],
          category: (cols[2] || 'perfume') as Product['category'],
          buyPrice: Number(cols[3]) || 0,
          sellPrice: Number(cols[4]) || 0,
          stock: Number(cols[5]) || 0,
          image: cols[6] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
          description: cols[7] || '',
        };
      });
      setProducts(prev => [...prev, ...newProducts]);
      toast({ title: `${newProducts.length} produtos importados!` });
    };
    reader.readAsText(file);
    e.target.value = '';
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
    a.href = url; a.download = 'produtos_sinho.csv'; a.click();
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Cadastro de Produtos</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> CSV em Massa
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={openNewForm}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou marca..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
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
              <Select value={form.category} onValueChange={v => {
                setForm(f => ({ ...f, category: v as Product['category'], sku: generateSKU(v, f.brand) }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <div>
                <label className="text-xs text-muted-foreground">Valor Compra (R$) *</label>
                <Input type="number" step="0.01" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Valor Venda (R$) *</label>
                <Input type="number" step="0.01" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Estoque Inicial</label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">SKU (auto)</label>
                <Input value={form.sku} readOnly className="bg-muted/50" />
              </div>
              <Input placeholder="URL da Foto" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="sm:col-span-2" maxLength={500} />
              <Textarea placeholder="Descrição do produto" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="lg:col-span-3" maxLength={500} rows={3} />
            </div>
            {form.buyPrice && form.sellPrice && (
              <div className="mt-4 flex gap-6 text-sm bg-secondary/30 rounded-lg p-3">
                <span>Lucro: <strong className="text-primary">{formatBRL(Number(form.sellPrice) - Number(form.buyPrice))}</strong></span>
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
                {filtered.map(p => {
                  const lucro = p.sellPrice - p.buyPrice;
                  const ganho = ((lucro / p.buyPrice) * 100).toFixed(1);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.brand}</TableCell>
                      <TableCell>{CATEGORIES[p.category]}</TableCell>
                      <TableCell className="text-right">{formatBRL(p.buyPrice)}</TableCell>
                      <TableCell className="text-right">{formatBRL(p.sellPrice)}</TableCell>
                      <TableCell className="text-right text-primary">{formatBRL(lucro)}</TableCell>
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
