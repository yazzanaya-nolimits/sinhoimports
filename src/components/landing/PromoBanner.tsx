import { useBanner } from '@/hooks/useBanner';
import { Icon } from './Icon';

/**
 * Faixa de aviso editada no painel (Banner). Discreta, no tom da marca:
 * sem vermelho e sem letreiro correndo, para não parecer liquidação.
 */
const PromoBanner = () => {
  const { banner } = useBanner();
  const visible = !!banner && banner.ativo && !!banner.mensagem.trim();

  if (!visible) return null;

  return (
    <div className="w-full bg-sinho-panel border-b border-sinho-line">
      <p className="mx-auto max-w-[1280px] px-4 py-2.5 flex items-center justify-center gap-2.5 text-center text-[11px] sm:text-xs tracking-[0.18em] uppercase text-sinho-ivory">
        <Icon name="local_offer" className="w-4 h-4 text-sinho-gold" />
        <span>{banner!.mensagem}</span>
      </p>
    </div>
  );
};

export default PromoBanner;
