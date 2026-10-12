import { useState, useEffect } from 'react';
import { X, MessageCircle } from '@/components/landing/Icon';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" role="dialog" aria-modal="true" aria-label={config.text}>
      <div className="sinho-site relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-center shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-11 h-11 rounded-full inline-flex items-center justify-center text-sinho-ivory hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-sinho-ink px-8 pt-10 pb-8 flex flex-col items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-sinho-gold text-sinho-ink inline-flex items-center justify-center">
            <MessageCircle className="w-8 h-8" />
          </span>
          <h3 className="font-display text-2xl tracking-[0.04em] uppercase text-sinho-ivory">{config.text}</h3>
        </div>
        <div className="px-8 py-7 flex flex-col gap-5">
          <p className="text-[15px] text-sinho-meta">Fale com a gente no WhatsApp e garanta seu desconto exclusivo.</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[52px] rounded-full bg-sinho-gold text-sinho-ink inline-flex items-center justify-center gap-2 text-[13px] font-semibold tracking-[0.16em] uppercase hover:bg-sinho-gold-hover"
          >
            <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
