import { Icon } from '@/components/icons';
import { container, sectionTitle } from './ui';

// Edite as respostas para refletir prazos e condições reais da loja.
const faqs = [
  { q: 'Os perfumes são originais?', a: 'Sim. Trabalhamos com produtos originais, que acompanham certificado de autenticidade.' },
  { q: 'Vocês entregam na minha cidade?', a: 'Enviamos para todo o Brasil. Mande seu CEP no WhatsApp para saber prazo e frete.' },
  { q: 'Como funciona o pagamento?', a: 'Pelo botão Comprar de cada produto, com pagamento pelo Mercado Pago quando disponível, ou fechando direto pelo WhatsApp.' },
  { q: 'Quanto tempo dura a fixação?', a: 'Depende do perfume e da pele. As fragrâncias árabes costumam ter concentração alta e fixação longa. No WhatsApp indicamos as que mais duram.' },
  { q: 'Tenho um cupom. Onde uso?', a: 'No catálogo, digite o código no campo Cupom. O preço com desconto aparece nos produtos válidos.' },
];

const StoreFaq = () => (
  <section id="duvidas" aria-label="Dúvidas frequentes" className={`${container} py-12 sm:py-16 scroll-mt-28`}>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8 lg:gap-16">
      <div className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Dúvidas frequentes</h2>
        <p className="text-base leading-relaxed text-sinho-meta">Não encontrou o que procurava? Fale com a gente no WhatsApp.</p>
      </div>
      <div className="bg-white border border-sinho-card-line rounded-2xl px-5 sm:px-8">
        {faqs.map((f, i) => (
          <details key={f.q} className={`group ${i > 0 ? 'border-t border-sinho-card-line' : ''}`}>
            <summary className="flex items-center justify-between gap-6 min-h-[64px] py-4 cursor-pointer list-none text-base sm:text-lg text-sinho-dark [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="add" className="w-6 h-6 text-sinho-bronze transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-6 pr-10 text-[15px] leading-relaxed text-sinho-meta">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default StoreFaq;
