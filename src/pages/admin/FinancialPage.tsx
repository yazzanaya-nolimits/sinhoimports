import { useMemo, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { formatBRL } from '@/lib/brl';
import { useToast } from '@/hooks/use-toast';
import { useFinanceiro } from '@/hooks/useFinanceiro';

const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#eab308', '#a855f7', '#f97316'];
const CAT_DESPESA = ['fornecedores', 'operacional', 'marketing', 'outros'];
const CAT_RECEITA = ['venda', 'outros'];

const FinancialPage = () => {
  const { toast } = useToast();
  const { lancamentos, criarLancamento, removerLancamento } = useFinanceiro();

  const [periodo, setPeriodo] = useState('30');
  const [form, setForm] = useState({
    tipo: 'despesa' as 'receita' | 'despesa',
    categoria: 'operacional',
    descricao: '',
    valor: '',
    forma_pagamento: 'pix',
  });

  const filtrados = useMemo(() => {
    const cutoff = periodo === 'all' ? 0 : Date.now() - parseInt(periodo) * 86400000;
    return lancamentos.filter(l => l.status !== 'estornado' && (!cutoff || new Date(l.created_at).getTime() >= cutoff));
  }, [lancamentos, periodo]);

  const totais = useMemo(() => {
    const receita = filtrados.filter(l => l.tipo === 'receita').reduce((s, l) => s + Number(l.valor), 0);
    const despesa = filtrados.filter(l => l.tipo === 'despesa').reduce((s, l) => s + Number(l.valor), 0);
    const lucro = receita - despesa;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;
    return { receita, despesa, lucro, margem };
  }, [filtrados]);

  const dadosLinha = useMemo(() => {
    const dias = periodo === 'all' ? 90 : parseInt(periodo);
    const buckets: Record<string, { dia: string; receita: number; despesa: number; lucro: number }> = {};
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const k = d.toISOString().slice(0, 10);
      buckets[k] = { dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), receita: 0, despesa: 0, lucro: 0 };
    }
    filtrados.forEach(l => {
      const k = l.created_at.slice(0, 10);
      if (!buckets[k]) return;
      if (l.tipo === 'receita') buckets[k].receita += Number(l.valor);
      else buckets[k].despesa += Number(l.valor);
    });
    Object.values(buckets).forEach(b => { b.lucro = b.receita - b.despesa; });
    return Object.values(buckets);
  }, [filtrados, periodo]);

  const dadosPag = useMemo(() => {
    const map = new Map<string, number>();
    filtrados.filter(l => l.tipo === 'receita').forEach(l => {
      const k = l.forma_pagamento || 'outros';
      map.set(k, (map.get(k) || 0) + Number(l.valor));
    });
    return Array.from(map.entries()).map(([name, valor]) => ({ name: name.toUpperCase(), valor }));
  }, [filtrados]);

  const dadosCatDesp = useMemo(() => {
    const map = new Map<string, number>();
    filtrados.filter(l => l.tipo === 'despesa').forEach(l => {
      const k = l.categoria;
      map.set(k, (map.get(k) || 0) + Number(l.valor));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtrados]);

  const handleAdd = async () => {
    if (!form.descricao || !form.valor) {
      toast({ title: 'Preencha descrição e valor', variant: 'destructive' });
      return;
    }
    const { error } = await criarLancamento({
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      forma_pagamento: form.forma_pagamento,
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Lançamento adicionado!' });
      setForm({ ...form, descricao: '', valor: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Receita automática das vendas + despesas operacionais.</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hoje</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-500" /></div>
          <div><p className="text-xs text-muted-foreground">Receita</p><p className="text-lg font-bold text-green-500">{formatBRL(totais.receita)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-xs text-muted-foreground">Despesas</p><p className="text-lg font-bold text-red-500">{formatBRL(totais.despesa)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Lucro líquido</p><p className={`text-lg font-bold ${totais.lucro >= 0 ? 'text-primary' : 'text-red-500'}`}>{formatBRL(totais.lucro)}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Margem geral</p>
          <p className={`text-2xl font-bold ${totais.margem >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totais.margem.toFixed(1)}%</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Receita × Despesa × Lucro</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="lucro" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Receita por forma de pagamento</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dadosPag}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Bar dataKey="valor" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Despesas por categoria</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={dadosCatDesp} dataKey="value" nameKey="name" outerRadius={80} label>
                {dadosCatDesp.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Novo lançamento manual</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant={form.tipo === 'receita' ? 'default' : 'outline'}
                className={form.tipo === 'receita' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => setForm(f => ({ ...f, tipo: 'receita', categoria: 'outros' }))}>Receita</Button>
              <Button size="sm" variant={form.tipo === 'despesa' ? 'default' : 'outline'}
                className={form.tipo === 'despesa' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => setForm(f => ({ ...f, tipo: 'despesa', categoria: 'operacional' }))}>Despesa</Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm(f => ({ ...f, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(form.tipo === 'receita' ? CAT_RECEITA : CAT_DESPESA).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Pagamento</Label>
                <Select value={form.forma_pagamento} onValueChange={v => setForm(f => ({ ...f, forma_pagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} maxLength={200} />
            <Input type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
            <Button onClick={handleAdd} className="w-full bg-gradient-gold text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Últimos lançamentos</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.slice(0, 100).map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{new Date(l.created_at).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={l.tipo === 'receita' ? 'text-green-500 border-green-500/40' : 'text-red-500 border-red-500/40'}>
                      {l.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{l.categoria}</TableCell>
                  <TableCell>{l.descricao}</TableCell>
                  <TableCell className="text-xs uppercase">{l.forma_pagamento || '—'}</TableCell>
                  <TableCell className={`text-right font-bold ${l.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                    {l.tipo === 'receita' ? '+' : '-'} {formatBRL(Number(l.valor))}
                  </TableCell>
                  <TableCell className="text-right">
                    {!l.venda_id && (
                      <Button size="icon" variant="ghost" onClick={() => removerLancamento(l.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!filtrados.length && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum lançamento no período.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialPage;
