import heroWatch from '@/assets/hero-watch.jpg';
import { WHATSAPP_NUMBER } from '@/data/products';
import { Icon } from './Icon';
import { btnOutline, container, eyebrow, sectionTitle } from './styles';

const features = [
  { icon: 'workspace_premium', title: 'Originais garantidos', desc: 'Produtos originais com certificado de autenticidade.' },
  { icon: 'public', title: 'Importação direta', desc: 'Direto dos fornecedores internacionais.' },
  { icon: 'local_shipping', title: 'Envio para todo o Brasil', desc: 'Entrega para todas as regiões do país.' },
  { icon: 'forum', title: 'Atendimento pessoal', desc: 'Indicação de perfume pelo WhatsApp, de segunda a sábado.' },
];

const watchesLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Olá! Quero ver os relógios disponíveis.',
)}`;

const AboutSection = () => (
  <>
    <section id="sobre" className="bg-sinho-ink border-t border-sinho-line scroll-mt-20">
      <div className={`${container} py-20 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20`}>
        <div className="flex flex-col gap-6">
          <span className={`${eyebrow} text-sinho-gold`}>Sobre a Sinho</span>
          <h2 className={`${sectionTitle} text-sinho-ivory`}>Cada frasco escolhido a dedo</h2>
          {/* Dica: troque por fatos concretos (desde quando importa, quantos clientes, quem é o Sinho). */}
          <p className="text-base sm:text-lg font-light leading-relaxed text-sinho-text">
            A Sinho Imports nasceu para trazer a perfumaria árabe original para o Brasil. Trabalhamos com casas
            como Lattafa e Al Haramain, conferimos a procedência de cada peça e enviamos para todo o país.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-9 content-center">
          {features.map(f => (
            <li key={f.title} className="flex gap-4">
              <Icon name={f.icon} className="w-8 h-8 text-sinho-gold mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <h3 className="font-body text-base font-medium text-sinho-ivory">{f.title}</h3>
                <p className="text-sm leading-relaxed text-sinho-muted">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section id="relogios" className="bg-sinho-ink scroll-mt-20">
      <div className={`${container} pb-20 sm:pb-24`}>
        <div className="grid md:grid-cols-2 border border-sinho-line">
          <div className="relative min-h-[280px] bg-sinho-panel overflow-hidden">
            <img src={heroWatch} alt="Relógio" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
            <span className={`${eyebrow} text-sinho-gold`}>Também na Sinho</span>
            <h2 className="font-display text-3xl sm:text-4xl tracking-[0.06em] uppercase text-sinho-ivory">Relógios</h2>
            <p className="text-base font-light leading-relaxed text-sinho-text">
              Invicta, Bulgari e outras marcas, com atendimento individual para escolher o modelo certo.
            </p>
            <a href={watchesLink} target="_blank" rel="noopener noreferrer" className={`${btnOutline} self-start`}>
              Consultar modelos
              <Icon name="arrow_forward" className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default AboutSection;
