import { Link } from 'react-router-dom';
import StoreShell from '@/components/store/StoreShell';
import { hasActiveOffer, useStore } from '@/components/store/useStore';
import { btnDark, btnLine } from '@/components/store/ui';
import { Icon } from '@/components/icons';

const NotFound = () => {
  const { ativos, categories } = useStore();

  return (
    <StoreShell categories={categories} hasOffers={ativos.some(hasActiveOffer)}>
      <div className="mx-auto w-full max-w-xl px-4 py-20 sm:py-28 flex flex-col items-center text-center gap-6">
        <span className="font-display text-7xl sm:text-8xl tracking-[0.1em] text-sinho-gold">404</span>
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] uppercase text-sinho-dark">Página não encontrada</h1>
        <p className="text-base text-sinho-meta">O endereço pode ter mudado. Que tal procurar direto no catálogo?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/catalogo" className={btnDark}><Icon name="storefront" className="w-5 h-5" /> Ver catálogo</Link>
          <Link to="/" className={btnLine}>Página inicial</Link>
        </div>
      </div>
    </StoreShell>
  );
};

export default NotFound;
