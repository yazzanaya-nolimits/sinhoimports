import { Shield, Truck, Star, Globe } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Originais Garantidos', desc: 'Todos os produtos são 100% originais com certificado de autenticidade.' },
  { icon: Truck, title: 'Envio para Todo Brasil', desc: 'Entrega rápida e segura para todas as regiões do país.' },
  { icon: Star, title: 'Qualidade Premium', desc: 'Curadoria exclusiva dos melhores perfumes e relógios do mundo.' },
  { icon: Globe, title: 'Importação Direta', desc: 'Produtos importados diretamente dos melhores fornecedores internacionais.' },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              Sobre a <span className="text-gradient-gold">Sinho Imports</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A Sinho Imports nasceu da paixão por produtos exclusivos e da missão de trazer 
                o melhor do luxo internacional para todo o Brasil. Somos especializados em perfumes 
                árabes originais, relógios de luxo e acessórios automotivos premium.
              </p>
              <p>
                Nossa curadoria rigorosa garante que cada produto oferecido é 100% autêntico e 
                de qualidade superior. Trabalhamos diretamente com os melhores fornecedores 
                internacionais para oferecer preços justos sem abrir mão da excelência.
              </p>
              <p>
                Com envio para todo o Brasil, facilitamos o acesso a marcas como Lattafa, 
                Al Haramain, Rolex, Bulgari e Invicta, entre outras.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-gold transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-serif font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
