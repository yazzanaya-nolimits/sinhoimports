import { useState } from 'react';
import { Send, MapPin, Phone, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { INSTAGRAM_URL, getWhatsAppLink } from '@/data/products';

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    toast({ title: 'Mensagem enviada!', description: 'Entraremos em contato em breve.' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contato" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Entre em <span className="text-gradient-gold">Contato</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Fale conosco pelo WhatsApp ou envie uma mensagem
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              placeholder="Seu nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-card border-border"
              maxLength={100}
            />
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="bg-card border-border"
              maxLength={255}
            />
            <Textarea
              placeholder="Sua mensagem"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="bg-card border-border min-h-[120px]"
              maxLength={1000}
            />
            <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </form>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-1">WhatsApp</h3>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  +55 11 97067-7627
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-1">Instagram</h3>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @sinhoimports
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-1">Localização</h3>
                <p className="text-muted-foreground">São Paulo, SP - Brasil</p>
                <p className="text-sm text-muted-foreground">Envios para todo o Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
