import { formatBRL } from '@/lib/brl';
import { getWhatsAppLink } from '@/data/products';
import { type DatabaseProduct } from '@/lib/supabase';
import { Icon } from '@/components/icons';
import { categoryLabel, couponLabel, hasActiveOffer, installmentText } from './useStore';

type Props = {
  product: DatabaseProduct;
  price: number;
  onOpen: (p: DatabaseProduct) => void;
  className?: string;
};

const ProductCard = ({ product, price, onOpen, className = '' }: Props) => {
  const hasDiscount = price < product.valor;
  const offer = hasActiveOffer(product);
  const parcelas = installmentText(product, price);
  const variations = product.variacoes?.length ?? 0;

  return (
    <article className={`group flex flex-col bg-white border border-sinho-card-line rounded-2xl overflow-hidden hover:shadow-[0_14px_32px_-18px_rgba(26,22,15,0.35)] transition-shadow ${className}`}>
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="relative block aspect-square bg-sinho-soft overflow-hidden text-left"
        aria-label={`Ver ${product.nome}`}
      >
        {product.foto_url ? (
          <img
            src={product.foto_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-sinho-chip">
            <Icon name="image" className="w-12 h-12" />
          </span>
        )}
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1">
          {product.destaque && (
            <span className="px-2.5 py-1 bg-sinho-ink text-sinho-ivory text-[10px] sm:text-[11px] font-medium tracking-[0.1em] uppercase">
              Destaque
            </span>
          )}
          {offer && (
            <span className="px-2.5 py-1 bg-sinho-gold text-sinho-ink text-[10px] sm:text-[11px] font-semibold tracking-[0.1em] uppercase">
              Cupom {couponLabel(product)}
            </span>
          )}
        </span>
      </button>

      <div className="flex flex-col gap-1.5 p-3.5 sm:p-5 flex-grow">
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-sinho-dark">
          {categoryLabel(product.categoria)}
        </span>
        <h3 className="font-body text-[15px] sm:text-base leading-snug text-sinho-body line-clamp-2">
          <button type="button" onClick={() => onOpen(product)} className="text-left hover:underline underline-offset-2">
            {product.nome}
          </button>
        </h3>
        {variations > 1 && <span className="text-[13px] text-sinho-meta">({variations} opções)</span>}

        <div className="mt-auto pt-3 flex flex-col">
          {hasDiscount && <span className="text-[13px] text-sinho-meta line-through">{formatBRL(product.valor)}</span>}
          <span className="text-xl sm:text-[26px] font-semibold leading-tight text-sinho-dark">{formatBRL(price)}</span>
          {parcelas && (
            <span className="mt-0.5 text-[11px] sm:text-[13px] font-medium tracking-[0.04em] uppercase text-sinho-meta">{parcelas}</span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onOpen(product)}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-sinho-ink text-sinho-ivory text-[12px] sm:text-[13px] font-medium tracking-[0.14em] uppercase hover:bg-black transition-colors"
          >
            <Icon name="shopping_bag" className="w-5 h-5" />
            Comprar
          </button>
          <a
            href={getWhatsAppLink(product.nome)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Perguntar sobre ${product.nome} no WhatsApp`}
            className="hidden sm:inline-flex w-11 h-11 items-center justify-center rounded-full border border-sinho-card-line text-sinho-dark hover:border-sinho-dark transition-colors"
          >
            <Icon name="forum" className="w-5 h-5" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
