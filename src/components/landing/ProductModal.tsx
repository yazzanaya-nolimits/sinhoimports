import { useMemo, useState, useEffect } from 'react';
import { MessageCircle, X, CreditCard, Tag, CheckCircle2, Loader2 } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBRL } from '@/lib/brl';
import { type DatabaseProduct } from '@/lib/supabase';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { supabase } from '@/integrations/supabase/client';



const PIX_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.282-.117H7.087l2.66 2.66c.79.79 2.07.79 2.86 0l2.66-2.66h-.99a.4.4 0 0 0-.282.117l-2.1 2.1a2.046 2.046 0 0 1-1.454.602M7.087 12.96h.994a.4.4 0 0 0 .282.117l2.1 2.1a2.043 2.043 0 0 0 2.908 0l2.1-2.1a.4.4 0 0 1 .282-.117h.994L13.34 15.62c-.79.79-2.07.79-2.86 0L7.087 12.96M16.747 9.583l-1.49-1.49a.288.288 0 0 0-.11-.072l-.06-.012H13.6l1.97 1.97a.794.794 0 0 1 .11.21l.05.143a.789.789 0 0 0 .11.21l1.49-1.49a.79.79 0 0 0 0-1.117M16.747 14.417l1.49-1.49a.79.79 0 0 0 0-1.117l-1.49-1.49a.789.789 0 0 1-.11.21l-.05.143a.794.794 0 0 1-.11.21l-1.97 1.97h1.487l.06-.012a.288.288 0 0 0 .11-.072"/>
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
  </svg>
);

interface Props {
  product: DatabaseProduct | null;
  discountedPrice?: number;
  onClose: () => void;
}

export default function ProductModal({ product, discountedPrice, onClose }: Props) {
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [parcelas, setParcelas] = useState<number>(1);
  const { config } = useSiteConfig();
  const [checkoutLoading, setCheckoutLoading] = useState(false);


  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.foto_url, product.imagem_destaque_url].filter(Boolean) as string[];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const variations = product.variacoes || [];
  const baseValue = discountedPrice ?? product.valor;
  const variationExtra = variations[selectedVariation]?.valor;
  const finalValue = variationExtra && variationExtra > 0 ? variationExtra : baseValue;
  const hasDiscount = discountedPrice !== undefined && discountedPrice < product.valor;

  const valorParcela = finalValue / parcelas;
  const parcelaOptions = Array.from({ length: product.max_parcelas || 12 }, (_, i) => i + 1);

  const waMessage = `Olá! Tenho interesse no produto: ${product.nome}${
    variations.length ? ` — variação ${variations[selectedVariation]?.tamanho}` : ''
  } (${formatBRL(finalValue)})`;

  const handleCheckout = async () => {
    if (!product) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: {
          product,
          variation: variations[selectedVariation],
          quantity: 1
        }
      });

      if (error) throw error;
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Erro ao iniciar checkout. Tente novamente ou use o WhatsApp.');
    } finally {
      setCheckoutLoading(false);
    }
  };


  return (
    <Dialog open={!!product} onOpenChange={o => !o && onClose()}>
      <DialogContent
        className="max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 border-primary/30"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Galeria */}
          <div className="bg-muted/30 p-4 md:p-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              {gallery[activeImage] ? (
                <img
                  src={gallery[activeImage]}
                  alt={product.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Sem imagem
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      i === activeImage ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold flex-1 min-w-0">{product.nome}</h2>
              {product.cupom_codigo && (
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Tag className="w-3 h-3" />
                  {product.cupom_tipo === 'percentual'
                    ? `${product.cupom_valor}% OFF`
                    : `${formatBRL(product.cupom_valor || 0)} OFF`}
                </Badge>
              )}
            </div>

            {product.descricao && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.descricao}</p>
            )}

            {/* Variações */}
            {variations.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Variação
                </p>
                <div className="flex flex-wrap gap-2">
                  {variations.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariation(i)}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                        i === selectedVariation
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {v.tamanho}
                      {v.valor && v.valor > 0 && (
                        <span className="ml-2 text-xs opacity-70">{formatBRL(v.valor)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preço */}
            <div className="border-y border-border py-4">
              {hasDiscount && !variationExtra && (
                <p className="text-sm text-muted-foreground line-through">{formatBRL(product.valor)}</p>
              )}
              <p className="text-3xl font-bold text-primary">{formatBRL(finalValue)}</p>
            </div>

            {/* Pagamento */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Formas de pagamento
              </p>

              {product.aceita_pix && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-green-500/20 text-green-500 flex items-center justify-center">
                      {PIX_ICON}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">PIX à vista</p>
                      <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-500">{formatBRL(finalValue)}</p>
                </div>
              )}

              {product.aceita_cartao && (
                <div className="p-3 rounded-lg bg-card border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Cartão de crédito</p>
                      <p className="text-xs text-muted-foreground">
                        Em até {product.max_parcelas}x
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={String(parcelas)} onValueChange={v => setParcelas(parseInt(v))}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {parcelaOptions.map(p => (
                          <SelectItem key={p} value={String(p)}>
                            {p}x de {formatBRL(finalValue / p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm font-bold whitespace-nowrap">
                      {parcelas}x {formatBRL(valorParcela)}
                    </p>
                  </div>
                </div>
              )}

              {!product.aceita_pix && !product.aceita_cartao && (
                <p className="text-xs text-muted-foreground italic">
                  Consulte formas de pagamento via WhatsApp.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {config?.mercado_pago_enabled && (
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground font-bold gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Pagar Agora (PIX/Cartão)
                    </>
                  )}
                </Button>
              )}


              <Button
                size="lg"
                variant={config?.mercado_pago_enabled ? "outline" : "default"}
                className={`w-full font-semibold gap-2 ${!config?.mercado_pago_enabled ? 'bg-gradient-gold text-primary-foreground' : ''}`}
                asChild
              >
                <a
                  href={`https://wa.me/5511970677627?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Comprar via WhatsApp
                </a>
              </Button>
            </div>

            {/* Informações adicionais */}
            {(product.ingredientes || product.modo_uso || product.informacoes_gerais) && (
              <div className="space-y-3 pt-3 border-t border-border">
                {product.ingredientes && (
                  <details className="group" open>
                    <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-primary">
                      Ingredientes
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{product.ingredientes}</p>
                  </details>
                )}
                {product.modo_uso && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-primary">
                      Modo de uso
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{product.modo_uso}</p>
                  </details>
                )}
                {product.informacoes_gerais && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-primary">
                      Informações gerais
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                      {product.informacoes_gerais}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
