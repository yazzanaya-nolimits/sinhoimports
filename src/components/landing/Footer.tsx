import { Instagram, Send, ChevronUp, MessageCircleMore, Mail } from 'lucide-react';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';

const socialIconClass =
  'group relative w-12 h-12 rounded-xl bg-secondary/60 backdrop-blur-sm border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1';

const Footer = () => {
  return (
    <footer className="relative border-t border-primary/20 bg-card/50 overflow-hidden">
      {/* Top neon accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-gradient-gold">Sinho Imports</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luxo original para todo Brasil. Perfumes árabes, relógios de luxo e tecnologia premium.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold">Links Rápidos</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#produtos" className="hover:text-primary transition-colors w-fit">Produtos</a>
              <a href="#sobre" className="hover:text-primary transition-colors w-fit">Sobre Nós</a>
              <a href="#contato" className="hover:text-primary transition-colors w-fit">Contato</a>
              <a href="/admin" className="hover:text-primary transition-colors w-fit">Área Restrita</a>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold">Conecte-se</h4>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialIconClass + ' hover:bg-primary/15 hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:border-primary/60'}
              >
                <Instagram className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
                <span className="absolute inset-0 rounded-xl ring-1 ring-primary/0 group-hover:ring-primary/40 transition-all" />
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className={socialIconClass + ' hover:bg-green-500/15 hover:shadow-[0_0_25px_rgba(34,197,94,0.55)] hover:border-green-400/60'}
              >
                <MessageCircleMore className="w-5 h-5 text-foreground/80 group-hover:text-green-400 transition-colors" />
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={socialIconClass + ' hover:bg-sky-500/15 hover:shadow-[0_0_25px_rgba(56,189,248,0.55)] hover:border-sky-400/60'}
              >
                <Send className="w-5 h-5 text-foreground/80 group-hover:text-sky-400 transition-colors" />
              </a>
              <a
                href="mailto:contato@sinhoimports.com"
                aria-label="E-mail"
                className={socialIconClass + ' hover:bg-primary/15 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:border-primary/50'}
              >
                <Mail className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground/80 pt-2">
              Atendimento de seg. a sáb. · Envios para todo o Brasil
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/15 flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <p className="text-center mx-auto">© 2026 Sinho Imports. Todos os direitos reservados.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ChevronUp className="w-4 h-4" /> Voltar ao topo
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
