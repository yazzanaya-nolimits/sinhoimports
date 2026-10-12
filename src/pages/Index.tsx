import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProductsSection from '@/components/landing/ProductsSection';
import AromasSection, { BrandsStrip } from '@/components/landing/AromasSection';
import AboutSection from '@/components/landing/AboutSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FaqSection from '@/components/landing/FaqSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import PromoBanner from '@/components/landing/PromoBanner';
import { Icon } from '@/components/landing/Icon';
import { getWhatsAppLink } from '@/data/products';

const Index = () => {
  return (
    <div className="sinho-site min-h-screen bg-sinho-ink text-sinho-ivory">
      <Navbar />
      {/* Espaço da navbar fixa (72px) */}
      <div className="h-[72px]" aria-hidden="true" />
      <PromoBanner />
      <main>
        <HeroSection />
        <BrandsStrip />
        <ProductsSection />
        <AromasSection />
        <AboutSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <ExitIntentPopup />

      {/* Botão flutuante do WhatsApp, respeita a área segura do celular */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          right: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="fixed z-40 w-14 h-14 rounded-full bg-sinho-gold text-sinho-ink flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] hover:bg-sinho-gold-hover transition-colors"
        aria-label="Falar no WhatsApp"
      >
        <Icon name="forum" className="w-7 h-7" />
      </a>
    </div>
  );
};

export default Index;
