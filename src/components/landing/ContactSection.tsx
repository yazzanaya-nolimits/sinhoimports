import { INSTAGRAM_URL, WHATSAPP_NUMBER } from '@/data/products';
import { Icon } from './Icon';
import { btnPrimary, container, eyebrow, sectionTitle } from './styles';

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=S%C3%A3o+Paulo%2C+SP%2C+Brasil';

const indicationLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Olá! Hoje eu uso o perfume ____. Qual árabe vocês me indicam?',
)}`;

const channels = [
  { icon: 'forum', label: 'WhatsApp', detail: 'Seg. a sáb.', href: `https://wa.me/${WHATSAPP_NUMBER}` },
  { icon: 'photo_camera', label: 'Instagram', detail: '@sinhoimports', href: INSTAGRAM_URL },
  { icon: 'location_on', label: 'Localização', detail: 'São Paulo, SP', href: MAPS_URL },
];

const ContactSection = () => (
  <section id="contato" className="bg-sinho-ink border-t border-sinho-line scroll-mt-20">
    <div className={`${container} py-20 sm:py-28 flex flex-col items-center text-center gap-6`}>
      <span className={`${eyebrow} text-sinho-gold`}>Atendimento</span>
      <h2 className={`${sectionTitle} max-w-[760px] text-sinho-ivory`}>Não sabe qual escolher? Fale com a gente</h2>
      <p className="max-w-[520px] text-base sm:text-lg font-light leading-relaxed text-sinho-text">
        Diga o perfume que você já usa e indicamos o árabe mais próximo do seu gosto.
      </p>
      <a href={indicationLink} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} min-h-[56px] px-9`}>
        <Icon name="forum" className="w-5 h-5" />
        Chamar no WhatsApp
      </a>

      <ul className="mt-12 w-full max-w-3xl grid sm:grid-cols-3 gap-px bg-sinho-line border border-sinho-line">
        {channels.map(c => (
          <li key={c.label} className="bg-sinho-ink">
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2.5 px-6 py-7 hover:bg-sinho-panel transition-colors"
            >
              <Icon name={c.icon} className="w-7 h-7 text-sinho-gold" />
              <span className="text-sm tracking-[0.16em] uppercase text-sinho-ivory">{c.label}</span>
              <span className="text-sm text-sinho-muted">{c.detail}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ContactSection;
