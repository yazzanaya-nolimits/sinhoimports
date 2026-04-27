import { useMemo, useState } from 'react';
import { Plus, Search, Download, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useEstoque, EstoqueItem, EstoqueStatus } from '@/hooks/useEstoque';
import { formatBRL } from '@/lib/brl';
import { downloadCSV } from '@/lib/csv';

const PIE_COLORS = ['#3b82f6', '#a855f7', '#eab308', '#f97316', '#22c55e', '#ef4444', '#0ea5e9', '#84cc16'];

const STATUS_LABEL: Record<EstoqueStatus, { label: string; cls: string }> = {
  disponivel: { label: 'Disponível', cls: 'bg-green-500/20 text-green-500 border-green-500/30' },
  baixo: { label: 'Estoque baixo', cls: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  esgotado: { label: 'Esgotado', cls: 'bg-red-500/20 text-red-500 border-red-500/30' },
};

export default function EstoquePage() {
  const { items, createItem, updateItem, adjustQuantity, deleteItem } = useEstoque();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<EstoqueItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let arr = items.filter(i => {
      if (search) {
        const q = search.toLowerCase();
        if (!i.nome.toLowerCase().includes(q) && !(i.tipo || '').toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      switch (sortBy) {
        case 'qty_desc': return b.quantidade - a.quantidade;
        case 'qty_asc': return a.quantidade - b.quantidade;
        case 'margem_desc': return b.margem_percentual - a.margem_percentual;
        case 'value_desc': return b.valor_venda - a.valor_venda;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return arr;
  }, [items, search, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    const total = items.length;
    const baixo = items.filter(i => i.status === 'baixo').length;
    const esgotado = items.filter(i => i.status === 'esgotado').length;
    const totalCompra = items.reduce((s, i) => s + i.valor_compra * i.quantidade, 0);
    const totalVenda = items.reduce((s, i) => s + i.valor_venda * i.quantidade, 0);
    const lucro = totalVenda - totalCompra;
    return { total, baixo, esgotado, totalCompra, totalVenda, lucro };
  }, [items]);

  const chartByQty = useMemo(
    () => items.slice(0, 10).map(i => ({ name: i.nome.slice(0, 14), qtd: i.quantidade })),
    [items],
  );

  const chartByType = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(i => {
      const k = i.tipo?.trim() || 'Sem tipo';
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  const handleExport = () => {
    const rows = filtered.map(i => ({
      nome: i.nome,
      tipo: i.tipo || '',
      quantidade: i.quantidade,
      quantidade_minima: i.quantidade_minima,
      valor_compra: i.valor_compra,
      valor_venda: i.valor_venda,
      lucro_unidade: i.lucro_valor,
      margem_percent: i.margem_percentual.toFixed(2),
      status: STATUS_LABEL[i.status].label,
    }));
    downloadCSV(`estoque_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground">Gestão interna separada do catálogo público.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          <p className="text-2xl font-bold">{metrics.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Estoque baixo</p>
          <p className="text-2xl font-bold text-yellow-500">{metrics.baixo}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Esgotados</p>
          <p className="text-2xl font-bold text-red-500">{metrics.esgotado}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total em compra</p>
          <p className="text-lg font-bold">{formatBRL(metrics.totalCompra)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total em venda</p>
          <p className="text-lg font-bold">{formatBRL(metrics.totalVenda)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Lucro potencial</p>
          <p className="text-lg font-bold text-green-500">{formatBRL(metrics.lucro)}</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="baixo">Estoque baixo</SelectItem>
            <SelectItem value="esgotado">Esgotado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="qty_desc">Maior quantidade</SelectItem>
            <SelectItem value="qty_asc">Menor quantidade</SelectItem>
            <SelectItem value="margem_desc">Maior margem</SelectItem>
            <SelectItem value="value_desc">Maior valor venda</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </Card>

      {/* Tabela */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">V. compra</TableHead>
              <TableHead className="text-right">V. venda</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell className="text-muted-foreground">{item.tipo || '—'}</TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell className="text-right">{formatBRL(item.valor_compra)}</TableCell>
                <TableCell className="text-right">{formatBRL(item.valor_venda)}</TableCell>
                <TableCell className="text-right">{formatBRL(item.lucro_valor)}</TableCell>
                <TableCell className="text-right">{item.margem_percentual.toFixed(1)}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_LABEL[item.status].cls}>
                    {STATUS_LABEL[item.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" title="Entrada (+1)" onClick={() => adjustQuantity(item, 1)}>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Saída (-1)" onClick={() => adjustQuantity(item, -1)}>
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(item); setOpenForm(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Nenhum produto cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Quantidade por produto (top 10)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartByQty}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="qtd" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Distribuição por tipo</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartByType} dataKey="value" nameKey="name" outerRadius={80} label>
                {chartByType.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <ItemFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        item={editing}
        onSave={async (payload) => {
          if (editing) {
            const { error } = await updateItem(editing.id, payload);
            if (error) { toast({ title: 'Erro ao salvar', variant: 'destructive' }); return false; }
            toast({ title: 'Produto atualizado!' });
          } else {
            const { error } = await createItem(payload);
            if (error) { toast({ title: 'Erro ao salvar', variant: 'destructive' }); return false; }
            toast({ title: 'Produto cadastrado!' });
          }
          return true;
        }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={o => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deleteItem(confirmDelete);
                  setConfirmDelete(null);
                  toast({ title: 'Produto excluído' });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemFormDialog({
  open, onOpenChange, item, onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: EstoqueItem | null;
  onSave: (p: Partial<EstoqueItem>) => Promise<boolean>;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<EstoqueItem>>({});
  const [saving, setSaving] = useState(false);

  // Reset whenever opens
  useMemo(() => {
    if (open) {
      setForm(item ? { ...item } : { quantidade: 0, quantidade_minima: 5, valor_compra: 0, valor_venda: 0 });
    }
  }, [open, item]);

  const lucro = (form.valor_venda || 0) - (form.valor_compra || 0);
  const margem = (form.valor_compra || 0) > 0 ? (lucro / (form.valor_compra || 1)) * 100 : 0;

  const submit = async () => {
    if (!form.nome?.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? 'Editar produto' : 'Novo produto'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome *</Label>
            <Input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Tipo (livre)</Label>
            <Input
              placeholder="Ex: Perfumaria, Eletrônico..."
              value={form.tipo || ''}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={form.quantidade ?? 0}
                onChange={e => setForm({ ...form, quantidade: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Estoque mínimo</Label>
              <Input
                type="number"
                value={form.quantidade_minima ?? 5}
                onChange={e => setForm({ ...form, quantidade_minima: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor de compra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor_compra ?? 0}
                onChange={e => setForm({ ...form, valor_compra: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Valor de venda (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor_venda ?? 0}
                onChange={e => setForm({ ...form, valor_venda: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <Card className="p-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Lucro por unidade</p>
                <p className={`font-bold ${lucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatBRL(lucro)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margem</p>
                <p className={`font-bold ${margem >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {margem.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
