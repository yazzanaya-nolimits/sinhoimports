import { LogIn, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminWriteGuard() {
  const navigate = useNavigate();
  const { isPinFallback, signOut } = useAuth();

  if (!isPinFallback) return null;

  const openLogin = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="flex flex-col gap-3 border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold">Acesso por PIN em modo somente leitura</p>
          <p className="text-xs text-muted-foreground">
            Entre com seu usuário e senha para enviar fotos ou salvar alterações.
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={openLogin} className="shrink-0">
        <LogIn className="mr-2 h-4 w-4" /> Entrar com usuário
      </Button>
    </div>
  );
}