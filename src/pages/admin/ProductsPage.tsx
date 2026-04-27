import { useState, useRef } from 'react';
import {
  Plus, Edit2, Save, X, Upload, Search, Filter, Trash2, Eye, EyeOff,
  Tag, Loader2, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/brl';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { type DatabaseProduct, type ProductVariation, PRODUTO_CATEGORIAS } from '@/lib/supabase';

type FormState = {
  nome: string;
  descricao: string;
  valor: string;
  foto_url: string;
  imagem_destaque_url: string;
  cupom_codigo: string;
  cupom_tipo: 'percentual' | 'fixo';
  cupom_valor: string;
  cupom_validade: string;
  status: 'ativo' | 'inativo';
  ingredientes: string;
  modo_uso: string;
  informacoes_gerais: string;
  variacoes: ProductVariation[];
  aceita_pix: boolean;
  aceita_cartao: boolean;
  max_parcelas: number;
  categoria: string;
  destaque: boolean;
};

const emptyForm: FormState = {
  nome: '', descricao: '', valor: '', foto_url: '', imagem_destaque_url: '',
  cupom_codigo: '', cupom_tipo: 'percentual', cupom_valor: '', cupom_validade: '',
  status: 'ativo',
  ingredientes: '', modo_uso: '', informacoes_gerais: '',
  variacoes: [],
  aceita_pix: true, aceita_cartao: true, max_parcelas: 12,
  categoria: 'outros', destaque: false,
};

const ProductsPage = () => {
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { products: dbProducts, saveProduct, deleteProduct, toggleStatus, uploadFile, loading } = useSupabaseProducts();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'nome_asc' | 'valor_asc' | 'valor_desc'>('created_desc');
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditId(null); };

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
      ingredientes: form.ingredientes || null,
      modo_uso: form.modo_uso || null,
      informacoes_gerais: form.informacoes_gerais || null,
      variacoes: form.variacoes,
      aceita_pix: form.aceita_pix,
      aceita_cartao: form.aceita_cartao,
      max_parcelas: form.max_parcelas,
      categoria: form.categoria,
      destaque: form.destaque,
    };
    if (editId) payload.id = editId;
    const result = await saveProduct(payload);
    if (result) resetForm();
  };

  const startEdit = (p: DatabaseProduct) => {
    setForm({
      nome: p.nome, descricao: p.descricao || '', valor: String(p.valor),
      foto_url: p.foto_url || '', imagem_destaque_url: p.imagem_destaque_url || '',
      cupom_codigo: p.cupom_codigo || '', cupom_tipo: p.cupom_tipo || 'percentual',
      cupom_valor: p.cupom_valor ? String(p.cupom_valor) : '',
      cupom_validade: p.cupom_validade || '', status: p.status,
      ingredientes: p.ingredientes || '', modo_uso: p.modo_uso || '',
      informacoes_gerais: p.informacoes_gerais || '',
      variacoes: Array.isArray(p.variacoes) ? p.variacoes : [],
      aceita_pix: p.aceita_pix ?? true, aceita_cartao: p.aceita_cartao ?? true,
      max_parcelas: p.max_parcelas ?? 12,
      categoria: p.categoria ?? 'outros',
      destaque: p.destaque ?? false,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_url' | 'imagem_destaque_url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máx 5MB', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    const url = await uploadFile(file);
    setIsUploading(false);
    if (url) setForm(prev => ({ ...prev, [field]: url }));
  };

  const addVariation = () => setForm(f => ({ ...f, variacoes: [...f.variacoes, { tamanho: '', valor: null }] }));
  const updateVariation = (i: number, patch: Partial<ProductVariation>) => {
    setForm(f => ({
      ...f,
      variacoes: f.variacoes.map((v, idx) => idx === i ? { ...v, ...patch } : v),
    }));
  };
  const removeVariation = (i: number) => {
    setForm(f => ({ ...f, variacoes: f.variacoes.filter((_, idx) => idx !== i) }));
  };

  const filtered = dbProducts
    .filter(p => !search || p.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'nome_asc': return a.nome.localeCompare(b.nome);
        case 'valor_asc': return a.valor - b.valor;
        case 'valor_desc': return b.valor - a.valor;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const previewDiscount = (() => {
    if (!form.cupom_codigo || !form.cupom_valor) return null;
    const valor = Number(form.valor) || 0;
    const desc = Number(form.cupom_valor);
    if (form.cupom_tipo === 'percentual') return Math.max(0, valor * (1 - desc / 100));
    return Math.max(0, valor - desc);
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Gestão de Produtos</h1>
        <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card" />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[200px] bg-card"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Mais recentes</SelectItem>
            <SelectItem value="nome_asc">Nome (A-Z)</SelectItem>
            <SelectItem value="valor_asc">Menor preço</SelectItem>
            <SelectItem value="valor_desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
        </span>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex justify-between">
              {editId ? 'Editar Produto' : 'Novo Produto'}
              <Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Linha 1 — básicos */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição Curta</Label>
                <Textarea rows={2} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
            </div>

            {/* Imagens */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Foto Principal</Label>
                <Button variant="outline" size="sm" className="w-full" onClick={() => photoInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload
                </Button>
                <input type="file" ref={photoInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileUpload(e, 'foto_url')} />
                {form.foto_url && <img src={form.foto_url} alt="" className="w-24 h-24 object-cover rounded border" />}
              </div>
              <div className="space-y-2">
                <Label>Imagem destaque/banner</Label>
                <Button variant="outline" size="sm" className="w-full" onClick={() => bannerInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload
                </Button>
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={e => handleFileUpload(e, 'imagem_destaque_url')} />
                {form.imagem_destaque_url && <img src={form.imagem_destaque_url} alt="" className="w-24 h-24 object-cover rounded border" />}
              </div>
            </div>

            {/* Conteúdo descritivo */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ingredientes</Label>
                <Textarea rows={4} value={form.ingredientes} onChange={e => setForm(f => ({ ...f, ingredientes: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Modo de uso</Label>
                <Textarea rows={4} value={form.modo_uso} onChange={e => setForm(f => ({ ...f, modo_uso: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Informações gerais</Label>
                <Textarea rows={4} value={form.informacoes_gerais} onChange={e => setForm(f => ({ ...f, informacoes_gerais: e.target.value }))} />
              </div>
            </div>

            {/* Variações dinâmicas */}
            <div className="p-4 border border-dashed rounded-lg space-y-3 bg-secondary/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm uppercase text-primary">Variações disponíveis</span>
                <Button size="sm" variant="outline" onClick={addVariation}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>
              {form.variacoes.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma variação. Ex: 30ml, 60ml, 100ml, 200ml</p>
              )}
              <div className="space-y-2">
                {form.variacoes.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Tamanho/volume (ex: 60ml)"
                      value={v.tamanho}
                      onChange={e => updateVariation(i, { tamanho: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor (opcional)"
                      value={v.valor ?? ''}
                      onChange={e => updateVariation(i, { valor: e.target.value ? Number(e.target.value) : null })}
                      className="w-40"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeVariation(i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagamento */}
            <div className="p-4 border border-dashed rounded-lg space-y-4 bg-secondary/10">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="w-4 h-4" />
                <span className="font-semibold text-sm uppercase">Formas de pagamento</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.aceita_pix} onCheckedChange={c => setForm(f => ({ ...f, aceita_pix: c }))} />
                  <Label>Aceita PIX</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.aceita_cartao} onCheckedChange={c => setForm(f => ({ ...f, aceita_cartao: c }))} />
                  <Label>Aceita cartão</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Máx parcelas</Label>
                  <Input
                    type="number" min={1} max={24}
                    value={form.max_parcelas}
                    onChange={e => setForm(f => ({ ...f, max_parcelas: Math.max(1, Math.min(24, Number(e.target.value) || 1)) }))}
                    disabled={!form.aceita_cartao}
                  />
                  {form.aceita_cartao && Number(form.valor) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {form.max_parcelas}x de {formatBRL(Number(form.valor) / form.max_parcelas)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cupom */}
            <div className="p-4 border border-dashed rounded-lg space-y-3 bg-secondary/10">
              <div className="flex items-center gap-2 text-primary">
                <Tag className="w-4 h-4" />
                <span className="font-semibold text-sm uppercase">Cupom de desconto</span>
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                <Input placeholder="Código (ex: PROMO10)" value={form.cupom_codigo} onChange={e => setForm(f => ({ ...f, cupom_codigo: e.target.value.toUpperCase() }))} />
                <Select value={form.cupom_tipo} onValueChange={v => setForm(f => ({ ...f, cupom_tipo: v as 'percentual' | 'fixo' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Valor desconto" value={form.cupom_valor} onChange={e => setForm(f => ({ ...f, cupom_valor: e.target.value }))} />
                <Input type="date" value={form.cupom_validade} onChange={e => setForm(f => ({ ...f, cupom_validade: e.target.value }))} />
              </div>
              {previewDiscount !== null && previewDiscount < Number(form.valor) && (
                <p className="text-xs text-green-500">
                  Valor com desconto: {formatBRL(previewDiscount)}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="status" checked={form.status === 'ativo'} onCheckedChange={c => setForm(f => ({ ...f, status: c ? 'ativo' : 'inativo' }))} />
              <Label htmlFor="status">Produto ativo na loja</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button className="bg-gradient-gold text-primary-foreground min-w-[140px]" onClick={handleSave} disabled={isUploading}>
                <Save className="mr-2 h-4 w-4" /> Salvar produto
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
              {Array.isArray(p.variacoes) && p.variacoes.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {p.variacoes.length} variação(ões)
                </p>
              )}
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
