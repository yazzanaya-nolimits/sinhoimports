import { useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useVendas } from '@/hooks/useVendas';
import { formatBRL } from '@/lib/brl';
import { downloadCSV } from '@/lib/csv';

const VendasHistoricoPage = () => {
  const { toast } = useToast();
  const { vendas, cancelarVenda } = useVendas();
  const [search, setSearch] = useState('');
  const [pag, setPag] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [periodo, setPeriodo] = useState('30');
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const cutoff = periodo === 'all' ? 0 : Date.now() - parseInt(periodo) * 86400000;
    return vendas.filter(v => {
      if (cutoff && new Date(v.created_at).getTime() < cutoff) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!v.produto_nome.toLowerCase().includes(q) && !(v.cliente_nome || '').toLowerCase().includes(q)) return false;
      }
      if (pag !== 'all' && v.forma_pagamento !== pag) return false;
      if (statusF !== 'all' && v.status !== statusF) return false;
      return true;
    });
  }, [vendas, search, pag, statusF, periodo]);

  const totais = useMemo(() => {
    const concluidas = filtradas.filter(v => v.status === 'concluida');
    return {
      qtd: concluidas.length,
      receita: concluidas.reduce((s, v) => s + Number(v.valor_total), 0),
      ticket: concluidas.length ? concluidas.reduce((s, v) => s + Number(v.valor_total), 0) / concluidas.length : 0,
    };
  }, [filtradas]);

  const exportar = () => {
    downloadCSV(`vendas_${Date.now()}.csv`, filtradas.map(v => ({
      data: new Date(v.created_at).toLocaleString('pt-BR'),
      produto: v.produto_nome,
      variacao: v.variacao || '',
      qtd: v.quantidade,
      valor_unitario: v.valor_unitario,
      desconto: v.desconto_aplicado,
      total: v.valor_total,
      pagamento: v.forma_pagamento,
      parcelas: v.parcelas,
      cliente: v.cliente_nome || '',
      status: v.status,
    })));
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    const { error } = await cancelarVenda(confirmCancel);
    setConfirmCancel(null);
    if (error) toast({ title: 'Erro ao cancelar', description: error.message, variant: 'destructive' });
    else toast({ title: 'Venda cancelada', description: 'Estoque e financeiro estornados.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">Histórico de Vendas</h1>
          <p className="text-sm text-muted-foreground">Consulte, filtre e cancele vendas com estorno automático.</p>
        </div>
        <Button variant="outline" onClick={exportar}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Vendas no período</p><p className="text-2xl font-bold">{totais.qtd}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Receita</p><p className="text-2xl font-bold text-green-500 break-words">{formatBRL(totais.receita)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Ticket médio</p><p className="text-2xl font-bold break-words">{formatBRL(totais.ticket)}</p></Card>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por produto ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hoje (24h)</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pag} onValueChange={setPag}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos pagamentos</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="md:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* MOBILE: cards */}
      <div className="md:hidden space-y-3">
        {filtradas.map(v => (
          <Card key={v.id} className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{v.produto_nome}{v.variacao && <span className="text-muted-foreground text-xs"> ({v.variacao})</span>}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(v.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <Badge variant="outline" className={`shrink-0 text-[10px] ${v.status === 'cancelada' ? 'text-red-500 border-red-500/40' : 'text-green-500 border-green-500/40'}`}>
                {v.status}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">Qtd</p><p className="font-medium">{v.quantidade}</p></div>
              <div><p className="text-muted-foreground">Total</p><p className="font-bold text-primary">{formatBRL(Number(v.valor_total))}</p></div>
              <div><p className="text-muted-foreground">Pag.</p><p className="font-medium uppercase">{v.forma_pagamento}{v.parcelas > 1 ? ` ${v.parcelas}x` : ''}</p></div>
            </div>
            {v.cliente_nome && <p className="text-xs"><span className="text-muted-foreground">Cliente: </span>{v.cliente_nome}</p>}
            {v.status === 'concluida' && (
              <div className="flex justify-end pt-1 border-t border-border/40">
                <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => setConfirmCancel(v.id)}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
              </div>
            )}
          </Card>
        ))}
        {!filtradas.length && (
          <Card className="p-6 text-center text-muted-foreground text-sm">Nenhuma venda encontrada.</Card>
        )}
      </div>

      {/* DESKTOP/TABLET: tabela */}
      <Card className="hidden md:block table-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map(v => (
              <TableRow key={v.id}>
                <TableCell className="text-xs">{new Date(v.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="font-medium">
                  {v.produto_nome}
                  {v.variacao && <span className="text-muted-foreground text-xs ml-1">({v.variacao})</span>}
                </TableCell>
                <TableCell className="text-right">{v.quantidade}</TableCell>
                <TableCell className="text-right font-bold text-primary">{formatBRL(Number(v.valor_total))}</TableCell>
                <TableCell className="text-xs uppercase">{v.forma_pagamento}{v.parcelas > 1 ? ` ${v.parcelas}x` : ''}</TableCell>
                <TableCell className="text-xs">{v.cliente_nome || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={v.status === 'cancelada' ? 'text-red-500 border-red-500/40' : 'text-green-500 border-green-500/40'}>
                    {v.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {v.status === 'concluida' && (
                    <Button size="icon" variant="ghost" title="Cancelar venda" onClick={() => setConfirmCancel(v.id)}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!filtradas.length && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma venda encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!confirmCancel} onOpenChange={o => !o && setConfirmCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar esta venda?</AlertDialogTitle>
            <AlertDialogDescription>
              A quantidade voltará ao estoque e a receita será estornada do financeiro automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Confirmar cancelamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendasHistoricoPage;
