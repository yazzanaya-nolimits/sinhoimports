import { useCallback, useMemo, useState } from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useToast } from '@/hooks/use-toast';
import { formatBRL } from '@/lib/brl';
import { PRODUTO_CATEGORIAS, type DatabaseProduct } from '@/lib/supabase';

export const categoryLabel = (id: string) =>
  PRODUTO_CATEGORIAS.find(c => c.id === id)?.label ?? (id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Outros');

export const couponLabel = (p: DatabaseProduct) =>
  p.cupom_tipo === 'percentual' ? `${p.cupom_valor}% off` : `${formatBRL(p.cupom_valor || 0)} off`;

const isCouponValid = (p: DatabaseProduct, now = new Date()) =>
  !!p.cupom_codigo && (!p.cupom_validade || new Date(p.cupom_validade) >= now);

export const hasActiveOffer = (p: DatabaseProduct) => isCouponValid(p);

/** Parcelamento só aparece quando o produto aceita cartão e tem mais de 1 parcela cadastrada no painel. */
export const installmentText = (p: DatabaseProduct, price: number) =>
  p.aceita_cartao && (p.max_parcelas ?? 1) > 1 ? `ou ${p.max_parcelas}x de ${formatBRL(price / p.max_parcelas)}` : null;

type AppliedCoupon = { code: string; discount: number; type: 'percentual' | 'fixo' };

/** Produtos ativos + categorias + cupom digitado pelo cliente. */
export function useStore() {
  const { products, loading } = useSupabaseProducts();
  const { toast } = useToast();
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);

  const ativos = useMemo(() => products.filter(p => p.status === 'ativo'), [products]);

  const categories = useMemo(
    () => Array.from(new Set(ativos.map(p => p.categoria || 'outros'))),
    [ativos],
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const c = code.trim().toUpperCase();
      if (!c) return false;
      const match = products.find(p => p.cupom_codigo?.toUpperCase() === c && isCouponValid(p));
      if (match) {
        setApplied({ code: match.cupom_codigo!, discount: match.cupom_valor || 0, type: (match.cupom_tipo || 'percentual') as AppliedCoupon['type'] });
        toast({ title: 'Cupom aplicado!', description: `Desconto de ${couponLabel(match)} nos produtos válidos.` });
        return true;
      }
      const expired = products.some(p => p.cupom_codigo?.toUpperCase() === c);
      toast({ title: expired ? 'Cupom expirado' : 'Cupom inválido', variant: 'destructive' });
      return false;
    },
    [products, toast],
  );

  const clearCoupon = useCallback(() => setApplied(null), []);

  const priceOf = useCallback(
    (p: DatabaseProduct) => {
      if (!applied || applied.code !== p.cupom_codigo) return p.valor;
      return applied.type === 'percentual'
        ? p.valor * (1 - applied.discount / 100)
        : Math.max(0, p.valor - applied.discount);
    },
    [applied],
  );

  return { ativos, loading, categories, applied, applyCoupon, clearCoupon, priceOf };
}
