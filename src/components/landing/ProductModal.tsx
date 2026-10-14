import { useMemo, useState, useEffect } from 'react';
import { Icon } from '@/components/icons';
import { WHATSAPP_NUMBER } from '@/data/products';
import { categoryLabel } from '@/components/store/useStore';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatBRL } from '@/lib/brl';
import { type DatabaseProduct } from '@/lib/supabase';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';



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
  const { config, loading: configLoading } = useSiteConfig();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();


  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.foto_url, product.imagem_destaque_url].filter(Boolean) as string[];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);

  // Ao abrir outro produto, volta para a primeira foto, a primeira variação e 1 parcela
  useEffect(() => {
    setActiveImage(0);
    setSelectedVariation(0);
    setParcelas(1);
  }, [product?.id]);

  if (!product) return null;

  const variations = product.variacoes || [];
  const baseValue = discountedPrice ?? product.valor;
  const variationExtra = variations[selectedVariation]?.valor;
  const finalValue = variationExtra && variationExtra > 0 ? variationExtra : baseValue;
  const hasDiscount = discountedPrice !== undefined && discountedPrice < product.valor;

  const valorParcela = finalValue / parcelas;
  const parcelaOptions = Array.from({ length: product.max_parcelas || 12 }, (_, i) => i + 1);

  const waMessage = `Olá! Quero comprar o produto ${product.nome} (${
    variations.length && variations[selectedVariation]?.tamanho ? `${variations[selectedVariation].tamanho} - ` : ''
  }${formatBRL(finalValue)}). Pode me enviar o link de pagamento, por favor?`;

  const handleCheckout = async () => {
    if (!product) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: {
          product,
          variation: variations[selectedVariation],
          quantity: 1,
          installments: parcelas,
        }
      });

      if (error) {
        const response = 'context' in error ? error.context : undefined;
        if (response instanceof Response) {
          const details = await response.clone().json().catch(() => null);
          if (typeof details?.error === 'string') throw new Error(details.error);
        }
        throw new Error('Não foi possível conectar ao pagamento. Tente novamente.');
      }
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data?.error || 'O pagamento não retornou um endereço válido.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        title: 'Não foi possível iniciar o pagamento',
        description: err instanceof Error ? err.message : 'Tente novamente ou use o WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };


  const label = 'text-xs font-semibold uppercase tracking-[0.18em] text-sinho-meta';

  return (
    <Dialog open={!!product} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sinho-site max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-3xl border-sinho-card-line bg-white [&>button:last-child]:hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white border border-sinho-card-line flex items-center justify-center text-sinho-dark hover:border-sinho-dark transition-colors"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Galeria */}
          <div className="bg-sinho-soft p-4 sm:p-6 md:rounded-l-3xl">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white">
              {gallery[activeImage] ? (
                <img src={gallery[activeImage]} alt={product.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sinho-chip">
                  <Icon name="image" className="w-14 h-14" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Foto ${i + 1}`}
                    aria-pressed={i === activeImage}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-sinho-dark' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="p-5 sm:p-8 flex flex-col gap-5 text-sinho-dark">
            <div className="flex flex-col gap-2 pr-12">
              <span className="text-xs font-semibold tracking-[0.16em] uppercase">{categoryLabel(product.categoria)}</span>
              <h2 className="font-display text-2xl sm:text-[32px] leading-tight tracking-[0.03em]">{product.nome}</h2>
              {product.cupom_codigo && (
                <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-sinho-gold text-sinho-ink text-xs font-semibold tracking-[0.1em] uppercase">
                  <Icon name="sell" className="w-4 h-4" />
                  Cupom {product.cupom_codigo}:{' '}
                  {product.cupom_tipo === 'percentual' ? `${product.cupom_valor}% off` : `${formatBRL(product.cupom_valor || 0)} off`}
                </span>
              )}
            </div>

            {product.descricao && <p className="text-[15px] leading-relaxed text-sinho-body">{product.descricao}</p>}

            {variations.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className={label}>Opções</p>
                <div className="flex flex-wrap gap-2">
                  {variations.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedVariation(i)}
                      aria-pressed={i === selectedVariation}
                      className={`min-h-[44px] px-5 rounded-full border text-sm transition-colors ${
                        i === selectedVariation ? 'border-sinho-dark bg-sinho-ink text-sinho-ivory' : 'border-sinho-card-line hover:border-sinho-dark'
                      }`}
                    >
                      {v.tamanho}
                      {v.valor && v.valor > 0 && <span className="ml-2 opacity-70">{formatBRL(v.valor)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-y border-sinho-card-line py-5">
              {hasDiscount && !variationExtra && <p className="text-sm text-sinho-meta line-through">{formatBRL(product.valor)}</p>}
              <p className="text-[34px] font-semibold leading-tight">{formatBRL(finalValue)}</p>
              {product.aceita_cartao && (product.max_parcelas ?? 1) > 1 && (
                <p className="text-sm font-medium uppercase tracking-[0.04em] text-sinho-meta">
                  ou {product.max_parcelas}x de {formatBRL(finalValue / product.max_parcelas)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className={label}>Formas de pagamento</p>

              {product.aceita_pix && (
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-sinho-cream border border-sinho-card-line">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white border border-sinho-card-line text-[#1E7F6E] flex items-center justify-center">{PIX_ICON}</span>
                    <div>
                      <p className="font-medium text-[15px]">Pix à vista</p>
                      <p className="text-[13px] text-sinho-meta">Pagamento instantâneo</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatBRL(finalValue)}</p>
                </div>
              )}

              {product.aceita_cartao && (
                <div className="p-4 rounded-2xl bg-sinho-cream border border-sinho-card-line flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white border border-sinho-card-line flex items-center justify-center">
                      <Icon name="credit_card" className="w-5 h-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-[15px]">Cartão de crédito</p>
                      <p className="text-[13px] text-sinho-meta">Em até {product.max_parcelas}x</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={String(parcelas)} onValueChange={v => setParcelas(parseInt(v))}>
                      <SelectTrigger className="flex-1 h-11 rounded-full bg-white" aria-label="Número de parcelas"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {parcelaOptions.map(p => (
                          <SelectItem key={p} value={String(p)}>
                            {p}x de {formatBRL(finalValue / p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm font-semibold whitespace-nowrap">{parcelas}x {formatBRL(valorParcela)}</p>
                  </div>
                </div>
              )}

              {!product.aceita_pix && !product.aceita_cartao && (
                <p className="text-sm text-sinho-meta">Consulte as formas de pagamento pelo WhatsApp.</p>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[54px] rounded-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold tracking-[0.16em] uppercase transition-colors bg-sinho-gold text-sinho-ink hover:bg-sinho-gold-hover"
              >
                <Icon name="forum" className="w-5 h-5" /> Comprar pelo WhatsApp
              </a>
            </div>

            {(product.ingredientes || product.modo_uso || product.informacoes_gerais) && (
              <div className="border-t border-sinho-card-line">
                {[
                  { t: 'Ingredientes', v: product.ingredientes, open: true },
                  { t: 'Modo de uso', v: product.modo_uso },
                  { t: 'Informações gerais', v: product.informacoes_gerais },
                ]
                  .filter(x => x.v)
                  .map(x => (
                    <details key={x.t} className="group border-b border-sinho-card-line" open={x.open}>
                      <summary className="flex items-center justify-between min-h-[52px] cursor-pointer list-none text-[13px] font-semibold uppercase tracking-[0.16em] [&::-webkit-details-marker]:hidden">
                        {x.t}
                        <Icon name="expand_more" className="w-5 h-5 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="pb-4 text-sm leading-relaxed text-sinho-body whitespace-pre-line">{x.v}</p>
                    </details>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
