import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatBRL } from '@/lib/brl';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  value: number;
  description: string;
  date: string;
}

const initialTransactions: Transaction[] = [
  { id: '1', type: 'entrada', value: 5000, description: 'Vendas do dia', date: '2026-04-15' },
  { id: '2', type: 'saida', value: 1200, description: 'Compra de estoque', date: '2026-04-15' },
  { id: '3', type: 'entrada', value: 3500, description: 'Vendas do dia', date: '2026-04-14' },
  { id: '4', type: 'saida', value: 800, description: 'Frete', date: '2026-04-14' },
  { id: '5', type: 'entrada', value: 7200, description: 'Vendas do dia', date: '2026-04-13' },
  { id: '6', type: 'saida', value: 2000, description: 'Fornecedor', date: '2026-04-13' },
];

const COLORS = ['hsl(43, 72%, 55%)', 'hsl(0, 84%, 60%)'];

const FinancialPage = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [form, setForm] = useState({ type: 'entrada' as 'entrada' | 'saida', value: '', description: '', date: '' });

  const addTransaction = () => {
    if (!form.value || !form.description || !form.date) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setTransactions(prev => [{
      id: String(Date.now()), type: form.type,
      value: Number(form.value), description: form.description, date: form.date,
    }, ...prev]);
    setForm({ type: 'entrada', value: '', description: '', date: '' });
    toast({ title: 'Transação adicionada!' });
  };

  const totalEntradas = transactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.value, 0);
  const totalSaidas = transactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.value, 0);
  const saldo = totalEntradas - totalSaidas;

  const pieData = [
    { name: 'Entradas', value: totalEntradas },
    { name: 'Saídas', value: totalSaidas },
  ];

  const barData = [
    { name: 'Entradas', valor: totalEntradas },
    { name: 'Saídas', valor: totalSaidas },
    { name: 'Saldo', valor: saldo },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Financeiro</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-xl font-bold text-green-500">{formatBRL(totalEntradas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saídas</p>
              <p className="text-xl font-bold text-red-500">{formatBRL(totalSaidas)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="text-xl font-bold text-primary">{formatBRL(saldo)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg font-serif">Entradas vs Saídas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatBRL(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg font-serif">Visão Geral</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="hsl(0,0%,55%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
                <Tooltip formatter={(value: number) => formatBRL(value)} />
                <Bar dataKey="valor" fill="hsl(43, 72%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-serif">Nova Transação</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex gap-2">
              <Button size="sm" variant={form.type === 'entrada' ? 'default' : 'outline'}
                className={form.type === 'entrada' ? 'bg-green-600' : ''}
                onClick={() => setForm(f => ({ ...f, type: 'entrada' }))}>Entrada</Button>
              <Button size="sm" variant={form.type === 'saida' ? 'default' : 'outline'}
                className={form.type === 'saida' ? 'bg-red-600' : ''}
                onClick={() => setForm(f => ({ ...f, type: 'saida' }))}>Saída</Button>
            </div>
            <Input type="number" placeholder="Valor" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-32" />
            <Input placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="flex-1 min-w-[150px]" maxLength={200} />
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-40" />
            <Button onClick={addTransaction} className="bg-gradient-gold text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date + 'T12:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      t.type === 'entrada' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className={`text-right font-bold ${t.type === 'entrada' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'entrada' ? '+' : '-'} {formatBRL(t.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialPage;
