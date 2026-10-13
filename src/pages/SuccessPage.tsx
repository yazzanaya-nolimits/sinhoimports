import { Link } from 'react-router-dom';
import StoreShell from '@/components/store/StoreShell';
import { hasActiveOffer, useStore } from '@/components/store/useStore';
import { btnDark, btnLine } from '@/components/store/ui';
import { Icon } from '@/components/icons';

export default function SuccessPage() {
  const { ativos, categories } = useStore();

  return (
    <StoreShell categories={categories} hasOffers={ativos.some(hasActiveOffer)}>
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:py-24">
        <div className="bg-white border border-sinho-card-line rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center gap-6">
          <span className="w-20 h-20 rounded-full bg-sinho-ink text-sinho-gold inline-flex items-center justify-center">
            <Icon name="check_circle" className="w-10 h-10" />
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.06em] uppercase text-sinho-dark">Pedido recebido</h1>
            <p className="text-base leading-relaxed text-sinho-meta">
              Seu pagamento está sendo processado. Assim que for aprovado, você recebe a confirmação.
            </p>
          </div>
          <div className="w-full rounded-2xl bg-sinho-cream border border-sinho-card-line p-5 text-left flex gap-3">
            <Icon name="local_shipping" className="w-6 h-6 shrink-0 text-sinho-bronze" />
            <p className="text-[15px] leading-relaxed text-sinho-body">
              <strong className="font-medium text-sinho-dark">Próximos passos:</strong> entraremos em contato pelo WhatsApp para confirmar o envio e passar o código de rastreio.
            </p>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <Link to="/catalogo" className={`${btnDark} flex-1`}>
              <Icon name="shopping_bag" className="w-5 h-5" /> Continuar comprando
            </Link>
            <Link to="/" className={`${btnLine} flex-1`}>Voltar ao início</Link>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
