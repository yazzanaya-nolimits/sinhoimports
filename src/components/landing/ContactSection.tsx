import { MapPin, Instagram, MessageCircleMore } from 'lucide-react';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=S%C3%A3o+Paulo%2C+SP%2C+Brasil';

const ContactSection = () => {
  const items = [
    {
      label: 'WhatsApp',
      icon: MessageCircleMore,
      href: getWhatsAppLink(),
      iconClass: 'text-green-400',
      bgClass: 'bg-green-500/10 group-hover:bg-green-500/20 border-green-500/30 group-hover:border-green-400/60 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.45)]',
    },
    {
      label: 'Instagram',
      icon: Instagram,
      href: INSTAGRAM_URL,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/10 group-hover:bg-primary/20 border-primary/30 group-hover:border-primary/60 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.45)]',
    },
    {
      label: 'Localização',
      icon: MapPin,
      href: MAPS_URL,
      iconClass: 'text-sky-400',
      bgClass: 'bg-sky-500/10 group-hover:bg-sky-500/20 border-sky-500/30 group-hover:border-sky-400/60 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.45)]',
    },
  ];

  return (
    <section id="contato" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Entre em <span className="text-gradient-gold">Contato</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Fale conosco diretamente pelos nossos canais oficiais
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 max-w-3xl mx-auto">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl border flex items-center justify-center transition-all duration-300 ${it.bgClass}`}
              >
                <it.icon className={`w-10 h-10 md:w-12 md:h-12 ${it.iconClass} transition-colors`} />
              </div>
              <span className="font-serif text-base md:text-lg font-semibold tracking-wide">
                {it.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
