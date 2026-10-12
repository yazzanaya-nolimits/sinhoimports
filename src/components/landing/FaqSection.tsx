import { Icon } from './Icon';
import { sectionTitle } from './styles';

// Edite as respostas para refletir prazos e condições reais da loja.
const faqs = [
  {
    q: 'Os perfumes são originais?',
    a: 'Sim. Trabalhamos com produtos originais, que acompanham certificado de autenticidade.',
  },
  {
    q: 'Vocês entregam na minha cidade?',
    a: 'Enviamos para todo o Brasil. Mande seu CEP no WhatsApp para saber prazo e frete.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Pelo próprio site, no botão de compra do produto, com pagamento pelo Mercado Pago (Pix nos produtos que aceitam). Se preferir, fechamos pelo WhatsApp.',
  },
  {
    q: 'Quanto tempo dura a fixação?',
    a: 'Depende do perfume e da pele. As fragrâncias árabes costumam ter concentração alta e fixação longa. No WhatsApp indicamos as que mais duram.',
  },
  {
    q: 'Tenho um cupom. Onde uso?',
    a: 'Digite o código no campo Cupom, logo acima dos perfumes, e o preço com desconto aparece nos produtos válidos.',
  },
];

const FaqSection = () => (
  <section id="duvidas" className="bg-sinho-ink scroll-mt-20">
    <div className="mx-auto w-full max-w-[880px] px-4 sm:px-6 py-20 sm:py-24 flex flex-col gap-10">
      <h2 className={`${sectionTitle} text-center text-sinho-ivory`}>Dúvidas frequentes</h2>
      <div className="border-t border-sinho-line">
        {faqs.map(f => (
          <details key={f.q} className="group border-b border-sinho-line">
            <summary className="flex items-center justify-between gap-6 min-h-[64px] py-5 cursor-pointer list-none text-base sm:text-lg text-sinho-ivory [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="add" className="w-6 h-6 text-sinho-gold transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-6 pr-10 text-[15px] leading-relaxed text-sinho-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
