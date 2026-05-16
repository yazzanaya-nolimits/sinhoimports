import { useMemo, useState } from 'react';
import { Search, AlertTriangle, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProdutosEstoque, ProdutoEstoque } from '@/hooks/useProdutosEstoque';
import { useVendas } from '@/hooks/useVendas';
import { formatBRL } from '@/lib/brl';
import { getWhatsAppLink } from '@/data/products';

type FormaPag = 'pix' | 'cartao' | 'dinheiro';

const PDVPage = () => {
  const { toast } = useToast();
  const { items: produtos } = useProdutosEstoque();
  const { confirmarVenda } = useVendas();

  const [search, setSearch] = useState('');
  const [selecionado, setSelecionado] = useState<ProdutoEstoque | null>(null);
  const [variacao, setVariacao] = useState<string>('');
  const [quantidade, setQuantidade] = useState(1);
  const [formaPag, setFormaPag] = useState<FormaPag>('pix');
  const [parcelas, setParcelas] = useState(1);
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [cliente, setCliente] = useState('');
  const [salvando, setSalvando] = useState(false);

  const filtrados = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      (p.tipo || '').toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search, produtos]);

  const valorUnitario = useMemo(() => {
    if (!selecionado) return 0;
    if (variacao && Array.isArray(selecionado.variacoes)) {
      const v = selecionado.variacoes.find((x: any) => x.tamanho === variacao || x.label === variacao);
      if (v?.valor) return Number(v.valor);
    }
    return Number(selecionado.valor || 0);
  }, [selecionado, variacao]);

  const subtotal = valorUnitario * quantidade;
  const total = Math.max(0, subtotal - desconto);
  const estoqueDisponivel = selecionado?.quantidade ?? 0;
  const estoqueInsuficiente = selecionado ? quantidade > estoqueDisponivel : false;

  const reset = () => {
    setSelecionado(null);
    setVariacao('');
    setQuantidade(1);
    setFormaPag('pix');
    setParcelas(1);
    setCupom('');
    setDesconto(0);
    setObservacao('');
    setCliente('');
    setSearch('');
  };

  const confirmar = async () => {
    if (!selecionado) {
      toast({ title: 'Selecione um produto', variant: 'destructive' });
      return;
    }
    if (quantidade <= 0) {
      toast({ title: 'Quantidade inválida', variant: 'destructive' });
      return;
    }
    if (estoqueInsuficiente) {
      toast({ title: 'Estoque insuficiente', variant: 'destructive' });
      return;
    }
    setSalvando(true);
    const { error } = await confirmarVenda({
      produto_id: selecionado.id,
      quantidade,
      valor_unitario: valorUnitario,
      desconto,
      cupom: cupom || null,
      forma_pagamento: formaPag,
      parcelas: formaPag === 'cartao' ? parcelas : 1,
      observacao: observacao || null,
      cliente_nome: cliente || null,
      variacao: variacao || null,
    });
    setSalvando(false);
    if (error) {
      toast({ title: 'Erro ao registrar venda', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Venda registrada!', description: `Total: ${formatBRL(total)}` });
    reset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Coluna esquerda: busca e seleção */}
      <div className="lg:col-span-2 space-y-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto por nome ou tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {filtrados.length > 0 && !selecionado && (
          <div className="bg-card border border-border rounded-lg divide-y divide-border max-h-72 overflow-auto">
            {filtrados.map(p => (
              <button
                key={p.id}
                className="w-full flex items-center gap-4 p-3 hover:bg-secondary/50 transition-colors text-left"
                onClick={() => { setSelecionado(p); setSearch(''); }}
              >
                {p.imagem_destaque_url || p.foto_url ? (
                  <img src={p.imagem_destaque_url || p.foto_url!} alt={p.nome} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.tipo || '—'} · Estoque: {p.quantidade}
                  </p>
                </div>
                <span className="text-primary font-bold whitespace-nowrap">{formatBRL(p.valor)}</span>
              </button>
            ))}
          </div>
        )}

        {selecionado && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg font-serif">{selecionado.nome}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelecionado(null)}>Trocar produto</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline">Estoque: {estoqueDisponivel}</Badge>
                <Badge variant="outline" className={
                  selecionado.estoque_status === 'esgotado' ? 'text-red-500 border-red-500/40'
                    : selecionado.estoque_status === 'baixo' ? 'text-yellow-500 border-yellow-500/40'
                    : 'text-green-500 border-green-500/40'
                }>
                  {selecionado.estoque_status}
                </Badge>
                <span className="text-sm text-muted-foreground">Valor base: {formatBRL(selecionado.valor)}</span>
              </div>

              {Array.isArray(selecionado.variacoes) && selecionado.variacoes.length > 0 && (
                <div>
                  <Label>Variação</Label>
                  <Select value={variacao} onValueChange={setVariacao}>
                    <SelectTrigger><SelectValue placeholder="Selecionar variação" /></SelectTrigger>
                    <SelectContent>
                      {selecionado.variacoes.map((v: any, i: number) => (
                        <SelectItem key={i} value={v.tamanho || v.label || `v${i}`}>
                          {(v.tamanho || v.label)} {v.valor ? `— ${formatBRL(Number(v.valor))}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div>
                  <Label>Desconto (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={desconto}
                    onChange={e => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>

              {estoqueInsuficiente && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/30 rounded-md p-3 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Estoque insuficiente. Disponível: {estoqueDisponivel}.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Forma de pagamento</Label>
                  <Select value={formaPag} onValueChange={(v) => setFormaPag(v as FormaPag)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selecionado.aceita_pix && <SelectItem value="pix">PIX</SelectItem>}
                      {selecionado.aceita_cartao && <SelectItem value="cartao">Cartão de crédito</SelectItem>}
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formaPag === 'cartao' && (
                  <div>
                    <Label>Parcelas</Label>
                    <Select value={String(parcelas)} onValueChange={v => setParcelas(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: selecionado.max_parcelas || 12 }).map((_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{i + 1}x</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cupom (opcional)</Label>
                  <Input value={cupom} onChange={e => setCupom(e.target.value)} placeholder="CODIGO" />
                </div>
                <div>
                  <Label>Cliente (opcional)</Label>
                  <Input value={cliente} onChange={e => setCliente(e.target.value)} maxLength={100} />
                </div>
              </div>

              <div>
                <Label>Observação</Label>
                <Textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coluna direita: resumo */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-lg font-serif">Resumo da venda</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto</span>
              <span>- {formatBRL(desconto)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-border pt-4">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
            {formaPag === 'cartao' && parcelas > 1 && total > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {parcelas}x de {formatBRL(total / parcelas)}
              </p>
            )}
            <Button
              className="w-full bg-gradient-gold text-primary-foreground font-semibold"
              onClick={confirmar}
              disabled={!selecionado || estoqueInsuficiente || salvando}
            >
              <Check className="w-4 h-4 mr-2" />
              {salvando ? 'Registrando...' : 'Confirmar Venda'}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDVPage;
