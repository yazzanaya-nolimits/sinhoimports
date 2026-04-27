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
      <PromoBanner />
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <ExitIntentPopup />

      {/* Floating WhatsApp Button */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};

export default Index;
