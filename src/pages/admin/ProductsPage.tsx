import { useState, useRef } from 'react';
import { Plus, Download, Edit2, Save, X, Upload, Search, Filter, Trash2, Eye, EyeOff, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BRANDS, CATEGORIES } from '@/data/products';
import { formatBRL } from '@/lib/brl';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { type DatabaseProduct } from '@/lib/supabase';

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

  const handleSave = async () => {
    if (!form.nome || !form.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const payload: Partial<DatabaseProduct> = {
      nome: form.nome,
      descricao: form.descricao,
      valor: Number(form.valor),
      foto_url: form.foto_url,
      imagem_destaque_url: form.imagem_destaque_url,
      cupom_codigo: form.cupom_codigo || null,
      cupom_tipo: form.cupom_codigo ? form.cupom_tipo : null,
      cupom_valor: form.cupom_valor ? Number(form.cupom_valor) : null,
      cupom_validade: form.cupom_validade || null,
      status: form.status,
    };

    if (editId) payload.id = editId;

    const result = await saveProduct(payload);
    if (result) resetForm();
  };

  const startEdit = (p: DatabaseProduct) => {
    setForm({
      nome: p.nome,
      descricao: p.descricao || '',
      valor: String(p.valor),
      foto_url: p.foto_url || '',
      imagem_destaque_url: p.imagem_destaque_url || '',
      cupom_codigo: p.cupom_codigo || '',
      cupom_tipo: p.cupom_tipo || 'percentual',
      cupom_valor: p.cupom_valor ? String(p.cupom_valor) : '',
      cupom_validade: p.cupom_validade || '',
      status: p.status,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_url' | 'imagem_destaque_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'O tamanho máximo é 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const url = await uploadFile(file);
    setIsUploading(false);

    if (url) {
      setForm(prev => ({ ...prev, [field]: url }));
    }
  };

  const filtered = dbProducts.filter(p => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Gestão de Produtos</h1>
        <div className="flex gap-2">
          <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex justify-between">
              {editId ? 'Editar Produto' : 'Novo Produto'}
              <Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input placeholder="Ex: Raghba Lattafa" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição Curta</Label>
                  <Textarea placeholder="Detalhes do produto..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="status" checked={form.status === 'ativo'} onCheckedChange={checked => setForm(f => ({ ...f, status: checked ? 'ativo' : 'inativo' }))} />
                  <Label htmlFor="status">Produto Ativo na Loja</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Foto do Produto</Label>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => photoInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Foto
                      </Button>
                      <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'foto_url')} />
                      {form.foto_url && <img src={form.foto_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Banner/Destaque</Label>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => bannerInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Banner
                      </Button>
                      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'imagem_destaque_url')} />
                      {form.imagem_destaque_url && <img src={form.imagem_destaque_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />}
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-dashed rounded-lg space-y-4 bg-secondary/10">
                  <div className="flex items-center gap-2 text-primary">
                    <Tag className="w-4 h-4" />
                    <span className="font-semibold text-sm uppercase">Configurar Cupom</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Código (ex: PROMO10)" value={form.cupom_codigo} onChange={e => setForm(f => ({ ...f, cupom_codigo: e.target.value.toUpperCase() }))} />
                    <Select value={form.cupom_tipo} onValueChange={v => setForm(f => ({ ...f, cupom_tipo: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                        <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Valor Desconto" value={form.cupom_valor} onChange={e => setForm(f => ({ ...f, cupom_valor: e.target.value }))} />
                    <Input type="date" value={form.cupom_validade} onChange={e => setForm(f => ({ ...f, cupom_validade: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button className="bg-gradient-gold text-primary-foreground min-w-[120px]" onClick={handleSave} disabled={isUploading}>
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listagem */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary/50" />
            <p className="text-muted-foreground mt-2">Carregando catálogo...</p>
          </div>
        ) : filtered.map(p => (
          <Card key={p.id} className={`overflow-hidden group transition-all ${p.status === 'inativo' ? 'opacity-60 grayscale' : 'hover:border-primary/40'}`}>
            <div className="aspect-video relative overflow-hidden bg-muted">
              {p.foto_url ? (
                <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">Sem foto</div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm" onClick={() => toggleStatus(p.id, p.status)}>
                  {p.status === 'ativo' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
                </Button>
              </div>
              {p.cupom_codigo && (
                <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px]">
                  CUPOM: {p.cupom_codigo}
                </Badge>
              )}
            </div>
            <CardContent className="p-3 space-y-1">
              <h3 className="font-semibold text-sm truncate">{p.nome}</h3>
              <p className="text-primary font-bold">{formatBRL(p.valor)}</p>
              <div className="flex justify-between items-center pt-2">
                <Badge variant={p.status === 'ativo' ? 'outline' : 'secondary'} className="text-[10px]">
                  {p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => startEdit(p)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
