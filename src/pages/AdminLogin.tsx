import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Loader2, Hash } from '@/components/icons';
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

  const [username, setUsername] = useState('');
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
    if (!username.trim() || !senha) return;
    setLoading(true);
    const { error } = await signIn(username.trim(), senha);
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Marca */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0D0B08] text-[#F3ECDF]">
        <Link to="/" className="font-serif text-2xl tracking-[0.3em]">
          SINHO <span className="text-[#C9A45C]">IMPORTS</span>
        </Link>
        <div className="flex flex-col gap-5 max-w-md">
          <span className="text-xs tracking-[0.24em] uppercase text-[#C9A45C]">Painel de gestão</span>
          <p className="font-serif text-4xl leading-tight tracking-[0.04em] uppercase">Vendas, estoque e loja em um só lugar</p>
          <p className="text-base font-light leading-relaxed text-[#CFC5B3]">PDV, financeiro, CRM e a vitrine do site, com o acesso de cada membro da equipe.</p>
        </div>
        <span className="text-xs text-[#8C826F]">© {new Date().getFullYear()} Sinho Imports</span>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-10">

          <div className="space-y-3 mb-8">
            <Link to="/" className="lg:hidden block font-serif text-xl tracking-[0.3em] mb-6">
              SINHO <span className="text-primary">IMPORTS</span>
            </Link>
            <span className="w-14 h-14 rounded-full bg-foreground text-accent inline-flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </span>
            <h1 className="font-serif text-3xl tracking-[0.04em] uppercase">Entrar no painel</h1>
            <p className="text-sm text-muted-foreground">Use o usuário e a senha cadastrados em Configurações.</p>
          </div>

          {!showPinFallback ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nome de usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-full px-5 bg-background"
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
                    className="h-12 rounded-full px-5 pr-12 bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="gold"
                className="w-full h-12 font-semibold uppercase tracking-[0.16em] text-[13px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <Link to="/" className="inline-flex items-center gap-1 min-h-[44px] text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao site
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPinFallback(true)}
                  className="min-h-[44px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Hash className="w-4 h-4" /> Acessar com PIN
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
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all ${
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
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Primeiro acesso? Entre com PIN e cadastre o admin master em Configurações.
          </p>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminLogin;
