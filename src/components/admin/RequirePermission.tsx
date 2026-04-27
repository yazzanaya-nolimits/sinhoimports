import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, type Modulo } from '@/contexts/AuthContext';

type Props = {
  modulo: Modulo;
  levels?: string[];
  children: ReactNode;
};

const RequirePermission = ({ modulo, levels, children }: Props) => {
  const { hasPermission, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (!hasPermission(modulo, levels)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl border border-border bg-card/60 backdrop-blur">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
            <ShieldOff className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold">Acesso negado</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Você não tem permissão para acessar este módulo.
              <br />Solicite acesso ao administrador.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default RequirePermission;
