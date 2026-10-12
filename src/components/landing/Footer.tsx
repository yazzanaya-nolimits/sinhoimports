import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';
import { Icon } from './Icon';
import { container } from './styles';

const colTitle = 'text-xs tracking-[0.2em] uppercase text-sinho-faint';
const link = 'text-sinho-ivory hover:text-sinho-gold transition-colors w-fit';

const Footer = () => (
  <footer className="bg-sinho-deep border-t border-sinho-line">
    <div className={`${container} py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10`}>
      <div className="flex flex-col gap-4">
        <span className="font-display text-xl tracking-[0.32em] text-sinho-ivory">
          SINHO <span className="text-sinho-gold">IMPORTS</span>
        </span>
        <p className="text-sm leading-relaxed text-sinho-muted">
          Perfumaria árabe original com envio para todo o Brasil.
        </p>
      </div>

      <nav aria-label="Rodapé" className="flex flex-col gap-3 text-sm">
        <span className={colTitle}>Loja</span>
        <a href="/#produtos" className={link}>Perfumes</a>
        <a href="/#aromas" className={link}>Escolha pelo aroma</a>
        <a href="/#relogios" className={link}>Relógios</a>
        <a href="/catalogo" className={link}>Catálogo completo</a>
      </nav>

      <div className="flex flex-col gap-3 text-sm">
        <span className={colTitle}>Atendimento</span>
        <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-2`}>
          <Icon name="forum" className="w-[18px] h-[18px] text-sinho-gold" /> WhatsApp
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-2`}>
          <Icon name="photo_camera" className="w-[18px] h-[18px] text-sinho-gold" /> Instagram
        </a>
        <span className="inline-flex items-center gap-2 text-sinho-text">
          <Icon name="schedule" className="w-[18px] h-[18px] text-sinho-gold" /> Seg. a sáb.
        </span>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <span className={colTitle}>Empresa</span>
        <a href="/#sobre" className={link}>Sobre a Sinho</a>
        <a href="/#duvidas" className={link}>Dúvidas frequentes</a>
        <span className="inline-flex items-center gap-2 text-sinho-text">
          <Icon name="lock" className="w-[18px] h-[18px] text-sinho-gold" /> Pagamento via Mercado Pago
        </span>
      </div>
    </div>

    <div className={`${container} py-6 border-t border-sinho-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sinho-faint`}>
      <p>© {new Date().getFullYear()} Sinho Imports. Todos os direitos reservados.</p>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-1 min-h-[44px] hover:text-sinho-gold transition-colors"
        >
          <Icon name="arrow_upward" className="w-4 h-4" /> Voltar ao topo
        </button>
        <a href="/admin" className="min-h-[44px] inline-flex items-center hover:text-sinho-gold transition-colors">
          Área restrita
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
