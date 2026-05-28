import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-gradient-gold">Pedido Recebido!</h1>
            <p className="text-muted-foreground">
              Seu pagamento está sendo processado. Assim que for aprovado, você receberá uma notificação.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <p className="text-sm">
              <strong>Próximos passos:</strong><br />
              Entraremos em contato via WhatsApp para confirmar o envio e fornecer seu código de rastreio.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/catalogo')} className="w-full gap-2">
                <ShoppingBag className="w-4 h-4" /> Continuar Comprando
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full gap-2">
                Voltar ao Início <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
