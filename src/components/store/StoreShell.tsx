import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';
import { Icon } from '@/components/icons';
import StoreHeader from './StoreHeader';
import { container } from './ui';

const guarantees = [
  { icon: 'workspace_premium', text: 'Originais com certificado de autenticidade' },
  { icon: 'local_shipping', text: 'Envio para todo o Brasil' },
  { icon: 'lock', text: 'Pagamento seguro via Mercado Pago' },
  { icon: 'schedule', text: 'Atendimento de segunda a sábado' },
];

const colTitle = 'text-xs tracking-[0.2em] uppercase text-sinho-faint';
const footLink = 'text-sinho-ivory hover:text-sinho-gold transition-colors w-fit';

type Props = {
  children: ReactNode;
  categories: string[];
  hasOffers: boolean;
};

/** Estrutura comum de todas as páginas da loja: cabeçalho, conteúdo, selos e rodapé. */
const StoreShell = ({ children, categories, hasOffers }: Props) => (
  <div className="sinho-site min-h-screen flex flex-col">
    <StoreHeader categories={categories} hasOffers={hasOffers} />

    <main className="flex-1">{children}</main>

    <section aria-label="Garantias" className="bg-white border-t border-sinho-card-line">
      <ul className={`${container} py-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5`}>
        {guarantees.map(g => (
          <li key={g.text} className="flex items-center gap-3.5 text-sm sm:text-[15px] text-sinho-body">
            <Icon name={g.icon} className="w-8 h-8 shrink-0 text-sinho-bronze" />
            {g.text}
          </li>
        ))}
      </ul>
    </section>

    <footer className="bg-sinho-ink text-sinho-ivory">
      <div className={`${container} py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-9`}>
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl tracking-[0.3em]">SINHO <span className="text-sinho-gold">IMPORTS</span></span>
          <p className="text-sm leading-relaxed text-sinho-muted">Perfumaria árabe original com envio para todo o Brasil.</p>
        </div>
        <nav aria-label="Loja" className="flex flex-col gap-2.5 text-sm">
          <span className={colTitle}>Loja</span>
          <Link to="/catalogo" className={footLink}>Catálogo completo</Link>
          <Link to="/catalogo?ordem=novidades" className={footLink}>Novidades</Link>
          {hasOffers && <Link to="/catalogo?ofertas=1" className={footLink}>Ofertas</Link>}
        </nav>
        <nav aria-label="Ajuda" className="flex flex-col gap-2.5 text-sm">
          <span className={colTitle}>Ajuda</span>
          <Link to="/#duvidas" className={footLink}>Dúvidas frequentes</Link>
          <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className={`${footLink} inline-flex items-center gap-2`}>
            <Icon name="forum" className="w-[18px] h-[18px] text-sinho-gold" /> WhatsApp
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${footLink} inline-flex items-center gap-2`}>
            <Icon name="photo_camera" className="w-[18px] h-[18px] text-sinho-gold" /> @sinhoimports
          </a>
        </nav>
        <div className="flex flex-col gap-2.5 text-sm text-sinho-muted">
          <span className={colTitle}>Atendimento</span>
          <span>Segunda a sábado</span>
          <span>São Paulo, SP</span>
        </div>
      </div>
      <div className={`${container} py-5 border-t border-sinho-line flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sinho-faint`}>
        <p>© {new Date().getFullYear()} Sinho Imports. Todos os direitos reservados.</p>
        <Link to="/admin" className="min-h-[44px] inline-flex items-center hover:text-sinho-gold transition-colors">Área restrita</Link>
      </div>
    </footer>

    <ExitIntentPopup />

    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}
      className="fixed z-40 w-14 h-14 rounded-full bg-sinho-ink text-sinho-gold border border-sinho-gold/50 flex items-center justify-center shadow-[0_10px_28px_-8px_rgba(0,0,0,0.5)] hover:bg-black transition-colors"
      aria-label="Falar no WhatsApp"
    >
      <Icon name="forum" className="w-7 h-7" />
    </a>
  </div>
);

export default StoreShell;
