import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWhatsAppLink } from '@/data/products';
import { Icon } from './Icon';
import { container } from './styles';

const navLinks = [
  { label: 'Perfumes', href: '/#produtos' },
  { label: 'Aromas', href: '/#aromas' },
  { label: 'Relógios', href: '/#relogios' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Dúvidas', href: '/#duvidas' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sinho-ink/95 backdrop-blur-md border-b border-sinho-line">
      <div className={`${container} h-[72px] flex items-center justify-between gap-6`}>
        <Link
          to="/"
          className="font-display text-lg sm:text-xl tracking-[0.32em] text-sinho-ivory whitespace-nowrap"
        >
          SINHO <span className="text-sinho-gold">IMPORTS</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] tracking-[0.18em] uppercase text-sinho-ivory hover:text-sinho-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href="/#produtos"
            aria-label="Buscar produto"
            className="hidden sm:inline-flex w-11 h-11 items-center justify-center text-sinho-ivory hover:text-sinho-gold transition-colors"
          >
            <Icon name="search" className="w-6 h-6" />
          </a>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 h-11 px-5 ml-2 border border-sinho-gold text-sinho-gold text-xs tracking-[0.18em] uppercase hover:bg-sinho-gold hover:text-sinho-ink transition-colors"
          >
            <Icon name="forum" className="w-5 h-5" />
            WhatsApp
          </a>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-sinho-ivory"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden bg-sinho-ink border-t border-sinho-line transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Menu" className={`${container} py-4 flex flex-col`}>
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              tabIndex={menuOpen ? 0 : -1}
              className="flex items-center min-h-[48px] border-b border-sinho-line text-sm tracking-[0.18em] uppercase text-sinho-ivory"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={menuOpen ? 0 : -1}
            className="mt-4 inline-flex items-center justify-center gap-2 min-h-[52px] bg-sinho-gold text-sinho-ink text-[13px] font-medium tracking-[0.2em] uppercase"
          >
            <Icon name="forum" className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
