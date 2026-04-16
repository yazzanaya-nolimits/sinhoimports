import { Instagram, MessageCircle, ChevronUp } from 'lucide-react';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-gradient-gold">Sinho Imports</h3>
            <p className="text-sm text-muted-foreground">
              Luxo original para todo Brasil. Perfumes árabes, relógios de luxo e muito mais.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold">Links Rápidos</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#produtos" className="hover:text-primary transition-colors">Produtos</a>
              <a href="#sobre" className="hover:text-primary transition-colors">Sobre Nós</a>
              <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
              <a href="/admin" className="hover:text-primary transition-colors">Área Restrita</a>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sinho Imports. Todos os direitos reservados.</p>
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
