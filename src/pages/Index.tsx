import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProductsSection from '@/components/landing/ProductsSection';
import AboutSection from '@/components/landing/AboutSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import PromoBanner from '@/components/landing/PromoBanner';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/data/products';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Spacer para compensar a navbar fixa (h-16 = 4rem) */}
      <div className="h-16" aria-hidden="true" />
      <PromoBanner />
      <main>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <ExitIntentPopup />

      {/* Floating WhatsApp Button — respeita safe-area no mobile */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          right: 'max(1rem, env(safe-area-inset-right))',
        }}
        className="fixed z-50 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </a>
    </div>
  );
};

export default Index;
