import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const PIN_FALLBACK = '5387';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, membro, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pin, setPin] = useState('');

  // Se já logado, redireciona
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), senha);
    setLoading(false);
    if (error) {
      toast({ title: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Bem-vindo!' });
    navigate('/admin/dashboard');
  };

  const handlePin = (d: string) => {
    if (pin.length >= 4) return;
    const np = pin + d;
    setPin(np);
    if (np.length === 4) {
      if (np === PIN_FALLBACK) {
        localStorage.setItem('sinho_admin', 'true');
        navigate('/admin/dashboard');
        // recarrega para que AuthContext leia o flag
        setTimeout(() => window.location.reload(), 50);
      } else {
        toast({ title: 'PIN incorreto', variant: 'destructive' });
        setTimeout(() => setPin(''), 250);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Grid tech animado */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(210 100% 60% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 60% / 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      {/* Glow dourado */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle, hsl(43 72% 55% / 0.6), transparent 60%)' }} />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(210 100% 60% / 0.7), transparent 60%)' }} />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl"
          style={{ boxShadow: '0 20px 60px -10px hsl(43 72% 55% / 0.25), inset 0 1px 0 hsl(40 20% 92% / 0.05)' }}>

          {/* Logo */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--gradient-gold)', boxShadow: '0 10px 30px -8px hsl(43 72% 55% / 0.6)' }}>
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gradient-gold">Sinho · PDV</h1>
            <p className="text-xs tracking-[0.3em] uppercase text-electric">Admin Master</p>
          </div>

          {!showPinFallback ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Usuário (e-mail)
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/60 border-border focus-visible:border-primary focus-visible:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-12 pr-11 bg-background/60 border-border focus-visible:border-primary focus-visible:ring-primary/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold tracking-wide"
                style={{ background: 'var(--gradient-gold)', color: 'hsl(0 0% 4%)' }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  ← Voltar ao site
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPinFallback(true)}
                  className="text-muted-foreground hover:text-electric transition-colors flex items-center gap-1"
                >
                  <Hash className="w-3 h-3" /> Acessar com PIN
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Modo legado · Digite o PIN de 4 dígitos</p>
              </div>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      pin.length > i ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}>
                    {pin.length > i ? '●' : ''}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {[1,2,3,4,5,6,7,8,9].map((n) => (
                  <Button key={n} variant="outline" className="h-12 text-lg font-semibold"
                    onClick={() => handlePin(String(n))}>
                    {n}
                  </Button>
                ))}
                <Button variant="outline" className="h-12 text-xs" onClick={() => setPin('')}>Limpar</Button>
                <Button variant="outline" className="h-12 text-lg font-semibold" onClick={() => handlePin('0')}>0</Button>
                <Button variant="ghost" className="h-12 text-xs" onClick={() => setShowPinFallback(false)}>Voltar</Button>
              </div>
            </div>
          )}
        </div>

        {!membro && !authLoading && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Primeiro acesso? Entre com PIN e cadastre o admin master em Configurações.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
