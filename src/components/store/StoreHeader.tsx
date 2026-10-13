import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBanner } from '@/hooks/useBanner';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';
import { Icon } from '@/components/icons';
import { categoryLabel } from './useStore';
import { container } from './ui';

type Props = {
  categories: string[];
  hasOffers: boolean;
};

const navLink =
  'flex items-center min-h-[52px] px-4 xl:px-5 text-[13px] xl:text-sm tracking-[0.14em] uppercase text-sinho-dark hover:text-sinho-bronze transition-colors whitespace-nowrap';

const StoreHeader = ({ categories, hasOffers }: Props) => {
  const { banner } = useBanner();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
    setMenuOpen(false);
  };

  const campaign = banner?.ativo && banner.mensagem.trim() ? banner.mensagem : null;

  return (
    <header className="relative z-40">
      {/* Barra de campanha: mensagem do painel (Banner) */}
      <div className="bg-sinho-gold text-sinho-ink">
        <p className={`${container} min-h-[40px] py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center text-[12px] sm:text-[13px] font-medium tracking-[0.12em] uppercase`}>
          {campaign ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="local_offer" className="w-[18px] h-[18px]" />
              {campaign}
            </span>
          ) : (
            <span>Perfumaria árabe original</span>
          )}
          <span className="hidden sm:inline-flex items-center gap-2">
            <Icon name="local_shipping" className="w-[18px] h-[18px]" />
            Envio para todo o Brasil
          </span>
        </p>
      </div>

      {/* Header principal */}
      <div className="bg-sinho-ink text-sinho-ivory">
        <div className={`${container} py-3 sm:py-4 flex flex-wrap items-center gap-x-3 sm:gap-x-8 gap-y-3`}>
          <button
            type="button"
            className="lg:hidden w-11 h-11 -ml-2 inline-flex items-center justify-center"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Icon name="menu" className="w-7 h-7" />
          </button>

          <Link to="/" className="font-display text-[17px] sm:text-[26px] tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">
            SINHO <span className="text-sinho-gold">IMPORTS</span>
          </Link>

          <form role="search" onSubmit={submit} className="order-last lg:order-none basis-full lg:basis-auto lg:flex-1 relative">
            <label htmlFor="busca-loja" className="sr-only">Buscar na loja</label>
            <input
              id="busca-loja"
              type="search"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Busque por perfume, marca ou aroma"
              className="w-full h-12 pl-6 pr-14 rounded-full bg-sinho-ivory text-sinho-dark placeholder:text-sinho-meta border border-transparent focus:outline-none focus:border-sinho-gold text-base"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-1 top-1 w-10 h-10 inline-flex items-center justify-center rounded-full text-sinho-dark hover:bg-sinho-sand transition-colors"
            >
              <Icon name="search" className="w-6 h-6" />
            </button>
          </form>

          <nav aria-label="Atendimento" className="ml-auto lg:ml-0 flex items-center gap-1 sm:gap-2 -mr-2 sm:mr-0">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 min-h-[44px] px-2 sm:px-3 text-sm leading-tight hover:text-sinho-gold transition-colors"
            >
              <Icon name="support_agent" className="w-7 h-7 text-sinho-gold" />
              <span className="hidden md:block">Atendimento<br />WhatsApp</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Sinho Imports"
              className="hidden sm:inline-flex w-11 h-11 items-center justify-center hover:text-sinho-gold transition-colors"
            >
              <Icon name="photo_camera" className="w-7 h-7" />
            </a>
            <Link
              to="/catalogo"
              className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-3 text-sm tracking-[0.1em] uppercase hover:text-sinho-gold transition-colors"
            >
              <Icon name="storefront" className="w-7 h-7" />
              Catálogo
            </Link>
          </nav>
        </div>
      </div>

      {/* Menu de categorias */}
      <nav aria-label="Categorias" className="hidden lg:block bg-sinho-ivory border-b border-sinho-sand-line">
        <div className={`${container} flex items-stretch`}>
          <div className="flex items-stretch overflow-x-auto">
            {categories.map(c => (
              <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className={navLink}>
                {categoryLabel(c)}
              </Link>
            ))}
            <Link to="/catalogo?ordem=novidades" className={navLink}>Novidades</Link>
          </div>
          <span className="flex-1" />
          {hasOffers && (
            <Link
              to="/catalogo?ofertas=1"
              className="flex items-center gap-2 min-h-[52px] px-7 bg-sinho-gold text-sinho-ink font-display text-lg tracking-[0.16em] uppercase hover:bg-sinho-gold-hover transition-colors"
            >
              <Icon name="local_offer" className="w-5 h-5" />
              Ofertas
            </Link>
          )}
          <Link
            to="/catalogo"
            className="flex items-center min-h-[52px] px-8 bg-sinho-ink text-sinho-ivory text-sm tracking-[0.16em] uppercase hover:bg-black transition-colors"
          >
            Ver tudo
          </Link>
        </div>
      </nav>

      {/* Menu do celular */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-sinho-cream flex flex-col">
            <div className="h-[72px] px-5 bg-sinho-ink text-sinho-ivory flex items-center justify-between">
              <span className="font-display text-lg tracking-[0.3em]">SINHO <span className="text-sinho-gold">IMPORTS</span></span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="w-11 h-11 -mr-2 inline-flex items-center justify-center">
                <Icon name="close" className="w-7 h-7" />
              </button>
            </div>
            <nav aria-label="Categorias" className="flex-1 overflow-y-auto px-5 py-3 flex flex-col">
              {hasOffers && (
                <Link to="/catalogo?ofertas=1" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 min-h-[52px] border-b border-sinho-sand-line text-sinho-bronze font-medium tracking-[0.14em] uppercase">
                  <Icon name="local_offer" className="w-5 h-5" /> Ofertas
                </Link>
              )}
              {categories.map(c => (
                <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} onClick={() => setMenuOpen(false)} className="flex items-center justify-between min-h-[52px] border-b border-sinho-sand-line tracking-[0.14em] uppercase text-sinho-dark">
                  {categoryLabel(c)} <Icon name="chevron_right" className="w-5 h-5" />
                </Link>
              ))}
              <Link to="/catalogo?ordem=novidades" onClick={() => setMenuOpen(false)} className="flex items-center justify-between min-h-[52px] border-b border-sinho-sand-line tracking-[0.14em] uppercase text-sinho-dark">
                Novidades <Icon name="chevron_right" className="w-5 h-5" />
              </Link>
              <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="flex items-center justify-between min-h-[52px] border-b border-sinho-sand-line tracking-[0.14em] uppercase text-sinho-dark">
                Ver tudo <Icon name="chevron_right" className="w-5 h-5" />
              </Link>
            </nav>
            <div className="p-5">
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-sinho-gold text-sinho-ink text-[13px] font-medium tracking-[0.18em] uppercase">
                <Icon name="forum" className="w-5 h-5" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default StoreHeader;
