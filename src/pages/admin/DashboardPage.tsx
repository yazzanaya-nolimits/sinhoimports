import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, TrendingUp, AlertTriangle, Package,
  DollarSign, Users, ArrowRight, Boxes,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useVendas } from '@/hooks/useVendas';
import { useProdutosEstoque } from '@/hooks/useProdutosEstoque';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/brl';

const DashboardPage = () => {
  const { vendas } = useVendas();
  const { items: produtos } = useProdutosEstoque();
  const { lancamentos } = useFinanceiro();
  const [now, setNow] = useState(new Date());
  const [leadsQuentes, setLeadsQuentes] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase.from('crm_leads').select('id', { count: 'exact', head: true })
      .in('etapa', ['apresentacao', 'envio_proposta', 'negocio_fechado'])
      .then(({ count }) => setLeadsQuentes(count || 0));
  }, []);

  const periodos = useMemo(() => {
    const hojeStart = new Date(); hojeStart.setHours(0, 0, 0, 0);
    const semanaStart = new Date(Date.now() - 7 * 86400000);
    const mesStart = new Date(Date.now() - 30 * 86400000);
    const concluidas = vendas.filter(v => v.status === 'concluida');
    const sum = (arr: typeof vendas) => arr.reduce((s, v) => s + Number(v.valor_total), 0);
    return {
      hoje: sum(concluidas.filter(v => new Date(v.created_at) >= hojeStart)),
      hojeQtd: concluidas.filter(v => new Date(v.created_at) >= hojeStart).length,
      semana: sum(concluidas.filter(v => new Date(v.created_at) >= semanaStart)),
      mes: sum(concluidas.filter(v => new Date(v.created_at) >= mesStart)),
    };
  }, [vendas]);

  const margem30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400000;
    const ativos = lancamentos.filter(l => l.status !== 'estornado' && new Date(l.created_at).getTime() >= cutoff);
    const r = ativos.filter(l => l.tipo === 'receita').reduce((s, l) => s + Number(l.valor), 0);
    const d = ativos.filter(l => l.tipo === 'despesa').reduce((s, l) => s + Number(l.valor), 0);
    return r > 0 ? ((r - d) / r) * 100 : 0;
  }, [lancamentos]);

  const estoqueCritico = useMemo(
    () => produtos.filter(p => p.estoque_status !== 'disponivel').slice(0, 5),
    [produtos],
  );

  const ultimasVendas = useMemo(() => vendas.slice(0, 6), [vendas]);

  const grafico30 = useMemo(() => {
    const buckets: Record<string, { dia: string; valor: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const k = d.toISOString().slice(0, 10);
      buckets[k] = { dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), valor: 0 };
    }
    vendas.filter(v => v.status === 'concluida').forEach(v => {
      const k = v.created_at.slice(0, 10);
      if (buckets[k]) buckets[k].valor += Number(v.valor_total);
    });
    return Object.values(buckets);
  }, [vendas]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-hybrid">Dashboard Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão executiva do negócio em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-electric/30 bg-electric/5">
          <span className="w-1.5 h-1.5 rounded-full bg-electric pulse-glow" />
          <p className="text-xs text-electric-light font-mono">{now.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Receita hoje" value={formatBRL(periodos.hoje)} sub={`${periodos.hojeQtd} venda(s)`} icon={ShoppingCart} variant="gold" />
        <KpiCard label="Receita 7 dias" value={formatBRL(periodos.semana)} icon={TrendingUp} variant="electric" />
        <KpiCard label="Receita 30 dias" value={formatBRL(periodos.mes)} icon={DollarSign} variant="gold" />
        <KpiCard label="Margem 30 dias" value={`${margem30.toFixed(1)}%`} icon={TrendingUp} variant={margem30 >= 0 ? 'electric' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="card-luxury p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-hybrid rounded-full" />
              Receita — últimos 30 dias
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-electric">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={grafico30}>
              <defs>
                <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--gold))" />
                  <stop offset="100%" stopColor="hsl(var(--electric))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatBRL(v)} />
              <Line type="monotone" dataKey="valor" stroke="url(#lineGold)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="card-tech">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Estoque crítico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {estoqueCritico.length === 0 && <p className="text-sm text-muted-foreground">Tudo em ordem ✓</p>}
            {estoqueCritico.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
                <span className="truncate flex-1">{p.nome}</span>
                <Badge variant="outline" className={p.estoque_status === 'esgotado' ? 'text-destructive border-destructive/40' : 'text-warning border-warning/40'}>
                  {p.quantidade}
                </Badge>
              </div>
            ))}
            <Link to="/admin/estoque" className="text-xs text-electric hover:text-electric-light hover:underline flex items-center gap-1 mt-3">
              Ver todo o estoque <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Últimas vendas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ultimasVendas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma venda ainda.</p>}
            {ultimasVendas.map(v => (
              <div key={v.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{v.produto_nome}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString('pt-BR')} · {v.forma_pagamento}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatBRL(Number(v.valor_total))}</p>
                  <p className="text-xs text-muted-foreground">{v.status}</p>
                </div>
              </div>
            ))}
            <Link to="/admin/vendas" className="text-xs text-primary hover:underline flex items-center gap-1 pt-2">
              Ver histórico completo <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Acesso rápido</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <QuickLink to="/admin/pdv" icon={ShoppingCart} label="Nova Venda" />
            <QuickLink to="/admin/estoque" icon={Boxes} label="Estoque" />
            <QuickLink to="/admin/financial" icon={DollarSign} label="Financeiro" />
            <QuickLink to="/admin/crm" icon={Users} label={`CRM (${leadsQuentes} quentes)`} />
            <QuickLink to="/admin/products" icon={Package} label="Catálogo" />
            <QuickLink to="/admin/banner" icon={AlertTriangle} label="Banner" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const QuickLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2">
    <Link to={to}>
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-sm">{label}</span>
    </Link>
  </Button>
);

export default DashboardPage;
