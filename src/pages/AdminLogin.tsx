import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PIN = '2572';

const AdminLogin = () => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === ADMIN_PIN) {
          localStorage.setItem('sinho_admin', 'true');
          navigate('/admin/dashboard');
        } else {
          toast({ title: 'PIN incorreto', variant: 'destructive' });
          setTimeout(() => setPin(''), 300);
        }
      }
    }
  };

  const handleClear = () => setPin('');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">PDV Admin</h1>
          <p className="text-muted-foreground">Digite o PIN de acesso</p>
        </div>

        {/* PIN display */}
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                pin.length > i ? 'border-primary bg-primary/10 text-primary' : 'border-border'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <Button
              key={n}
              variant="outline"
              className="h-14 text-xl font-semibold border-border hover:border-primary/50 hover:bg-primary/10"
              onClick={() => handleDigit(String(n))}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-14 text-sm border-border hover:border-destructive/50"
            onClick={handleClear}
          >
            Limpar
          </Button>
          <Button
            variant="outline"
            className="h-14 text-xl font-semibold border-border hover:border-primary/50 hover:bg-primary/10"
            onClick={() => handleDigit('0')}
          >
            0
          </Button>
          <div />
        </div>

        <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors block">
          ← Voltar ao site
        </a>
      </div>
    </div>
  );
};

export default AdminLogin;
