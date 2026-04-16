import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_NUMBER } from '@/data/products';

interface PopupConfig {
  enabled: boolean;
  text: string;
  delay: number;
}

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);

  const config: PopupConfig = JSON.parse(
    localStorage.getItem('sinho_popup_config') || '{"enabled":true,"text":"Espere! Ganhe 10% off no WhatsApp","delay":0}'
  );

  useEffect(() => {
    if (!config.enabled) return;
    const dismissed = sessionStorage.getItem('sinho_popup_dismissed');
    if (dismissed) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setTimeout(() => setShow(true), config.delay * 1000);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [config.enabled, config.delay]);

  const close = () => {
    setShow(false);
    sessionStorage.setItem('sinho_popup_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-card border border-primary/30 rounded-2xl p-8 max-w-md mx-4 shadow-gold text-center space-y-4">
        <button onClick={close} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-serif font-bold">{config.text}</h3>
        <p className="text-muted-foreground text-sm">
          Fale conosco no WhatsApp e garanta seu desconto exclusivo!
        </p>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          asChild
        >
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Falar no WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
