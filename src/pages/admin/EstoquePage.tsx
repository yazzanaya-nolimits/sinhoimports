import { useMemo, useState } from 'react';
import { Search, Download, ArrowUp, ArrowDown, Edit2, History } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useProdutosEstoque, ProdutoEstoque } from '@/hooks/useProdutosEstoque';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/brl';
import { downloadCSV } from '@/lib/csv';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  disponivel: { label: 'Disponível', cls: 'bg-green-500/20 text-green-500 border-green-500/30' },
  baixo: { label: 'Estoque baixo', cls: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  esgotado: { label: 'Esgotado', cls: 'bg-red-500/20 text-red-500 border-red-500/30' },
};

export default function EstoquePage() {
  const { items, updateProduto, registrarEntrada } = useProdutosEstoque();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<ProdutoEstoque | null>(null);
  const [entrada, setEntrada] = useState<ProdutoEstoque | null>(null);
  const [movsOpen, setMovsOpen] = useState(false);
  const [movs, setMovs] = useState<any[]>([]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (search) {
        const q = search.toLowerCase();
        if (!i.nome.toLowerCase().includes(q) && !(i.tipo || '').toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all' && i.estoque_status !== statusFilter) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  const metrics = useMemo(() => {
    const total = items.length;
    const baixo = items.filter(i => i.estoque_status === 'baixo').length;
    const esgotado = items.filter(i => i.estoque_status === 'esgotado').length;
    const totalCompra = items.reduce((s, i) => s + Number(i.valor_compra) * i.quantidade, 0);
    const totalVenda = items.reduce((s, i) => s + Number(i.valor) * i.quantidade, 0);
    const lucro = totalVenda - totalCompra;
    return { total, baixo, esgotado, totalCompra, totalVenda, lucro };
  }, [items]);

  const chartByQty = useMemo(
    () => [...items].sort((a, b) => b.quantidade - a.quantidade).slice(0, 10).map(i => ({ name: i.nome.slice(0, 14), qtd: i.quantidade })),
    [items],
  );

  const exportar = () => {
    downloadCSV(`estoque_${Date.now()}.csv`, filtered.map(i => ({
      nome: i.nome,
      tipo: i.tipo || '',
      quantidade: i.quantidade,
      qtd_minima: i.quantidade_minima,
      valor_compra: i.valor_compra,
      valor_venda: i.valor,
      lucro_unidade: i.lucro_valor,
      margem_pct: Number(i.margem_percentual).toFixed(2),
      status: i.estoque_status,
    })));
  };

  const ajustarRapido = async (item: ProdutoEstoque, delta: number) => {
    const nova = Math.max(0, item.quantidade + delta);
    const { error } = await updateProduto(item.id, { quantidade: nova });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
  };

  const abrirHistorico = async (item: ProdutoEstoque) => {
    const { data } = await supabase
      .from('estoque_movimentacoes')
      .select('*')
      .eq('produto_id', item.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setMovs(data || []);
    setMovsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground">Cadastre produtos em "Catálogo do Site". Aqui você gerencia estoque, custos e movimentações.</p>
        </div>
        <Button variant="outline" onClick={exportar}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Produtos</p><p className="text-2xl font-bold">{metrics.total}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Estoque baixo</p><p className="text-2xl font-bold text-yellow-500">{metrics.baixo}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Esgotados</p><p className="text-2xl font-bold text-red-500">{metrics.esgotado}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total em custo</p><p className="text-lg font-bold">{formatBRL(metrics.totalCompra)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total em venda</p><p className="text-lg font-bold">{formatBRL(metrics.totalVenda)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Lucro potencial</p><p className="text-lg font-bold text-green-500">{formatBRL(metrics.lucro)}</p></Card>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">V. compra</TableHead>
              <TableHead className="text-right">V. venda</TableHead>
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
                <TableCell className="text-right font-bold">{item.quantidade}</TableCell>
                <TableCell className="text-right">{formatBRL(Number(item.valor_compra))}</TableCell>
                <TableCell className="text-right">{formatBRL(Number(item.valor))}</TableCell>
                <TableCell className="text-right">{Number(item.margem_percentual).toFixed(1)}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_LABEL[item.estoque_status]?.cls}>
                    {STATUS_LABEL[item.estoque_status]?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" title="-1" onClick={() => ajustarRapido(item, -1)}>
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button size="icon" variant="ghost" title="+1" onClick={() => ajustarRapido(item, 1)}>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Entrada" onClick={() => setEntrada(item)}>
                      <ArrowUp className="w-4 h-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Editar custo/venda" onClick={() => setEditing(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Histórico" onClick={() => abrirHistorico(item)}>
                      <History className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum produto encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Top 10 quantidade em estoque</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartByQty}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="qtd" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Dialog editar custo/venda/min */}
      <EditDialog item={editing} onClose={() => setEditing(null)} onSave={async (patch) => {
        if (!editing) return;
        const { error } = await updateProduto(editing.id, patch);
        if (error) toast({ title: 'Erro', variant: 'destructive' });
        else { toast({ title: 'Atualizado!' }); setEditing(null); }
      }} />

      {/* Dialog entrada manual */}
      <EntradaDialog item={entrada} onClose={() => setEntrada(null)} onConfirm={async (qtd, valor, motivo, gerarDespesa) => {
        if (!entrada) return;
        const { error } = await registrarEntrada(entrada.id, qtd, valor, motivo, gerarDespesa);
        if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Entrada registrada!' }); setEntrada(null); }
      }} />

      {/* Histórico de movimentações */}
      <Dialog open={movsOpen} onOpenChange={setMovsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Histórico de movimentações</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs">{new Date(m.created_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell><Badge variant="outline">{m.tipo}</Badge></TableCell>
                  <TableCell className="text-right">{m.quantidade}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.motivo || '—'}</TableCell>
                </TableRow>
              ))}
              {!movs.length && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Sem movimentações.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditDialog({ item, onClose, onSave }: { item: ProdutoEstoque | null; onClose: () => void; onSave: (p: Partial<ProdutoEstoque>) => void }) {
  const [valor, setValor] = useState(0);
  const [valorCompra, setValorCompra] = useState(0);
  const [qtdMin, setQtdMin] = useState(5);
  const [tipo, setTipo] = useState('');

  useMemo(() => {
    if (item) {
      setValor(Number(item.valor) || 0);
      setValorCompra(Number(item.valor_compra) || 0);
      setQtdMin(item.quantidade_minima || 5);
      setTipo(item.tipo || '');
    }
  }, [item]);

  const lucro = valor - valorCompra;
  const margem = valorCompra > 0 ? (lucro / valorCompra) * 100 : 0;

  return (
    <Dialog open={!!item} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar — {item?.nome}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Tipo</Label><Input value={tipo} onChange={e => setTipo(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Valor de compra (R$)</Label><Input type="number" step="0.01" value={valorCompra} onChange={e => setValorCompra(parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Valor de venda (R$)</Label><Input type="number" step="0.01" value={valor} onChange={e => setValor(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div><Label>Estoque mínimo</Label><Input type="number" value={qtdMin} onChange={e => setQtdMin(parseInt(e.target.value) || 0)} /></div>
          <Card className="p-3 bg-muted/30 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Lucro/un</p><p className={`font-bold ${lucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatBRL(lucro)}</p></div>
            <div><p className="text-xs text-muted-foreground">Margem</p><p className={`font-bold ${margem >= 0 ? 'text-green-500' : 'text-red-500'}`}>{margem.toFixed(2)}%</p></div>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave({ valor, valor_compra: valorCompra, quantidade_minima: qtdMin, tipo })}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EntradaDialog({ item, onClose, onConfirm }: { item: ProdutoEstoque | null; onClose: () => void; onConfirm: (q: number, v: number, m: string, g: boolean) => void }) {
  const [qtd, setQtd] = useState(1);
  const [valor, setValor] = useState(0);
  const [motivo, setMotivo] = useState('Compra de fornecedor');
  const [gerarDespesa, setGerarDespesa] = useState(true);

  useMemo(() => { if (item) { setQtd(1); setValor(Number(item.valor_compra) || 0); setMotivo('Compra de fornecedor'); setGerarDespesa(true); } }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Entrada de estoque — {item?.nome}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantidade</Label><Input type="number" min={1} value={qtd} onChange={e => setQtd(Math.max(1, parseInt(e.target.value) || 1))} /></div>
            <div><Label>Valor unitário (R$)</Label><Input type="number" step="0.01" value={valor} onChange={e => setValor(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div><Label>Motivo</Label><Input value={motivo} onChange={e => setMotivo(e.target.value)} /></div>
          <div className="flex items-center gap-3">
            <Switch checked={gerarDespesa} onCheckedChange={setGerarDespesa} id="gd" />
            <Label htmlFor="gd" className="cursor-pointer">Gerar despesa no financeiro ({formatBRL(qtd * valor)})</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(qtd, valor, motivo, gerarDespesa)}>Registrar entrada</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
