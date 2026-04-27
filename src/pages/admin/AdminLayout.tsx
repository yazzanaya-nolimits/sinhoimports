import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart, DollarSign, Package, Users, LayoutDashboard,
  LogOut, Menu, X, Home, Kanban, Boxes, Image, Megaphone, History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const sidebarItems = [
  { label: 'Dashboard Geral', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'PDV — Vendas', icon: ShoppingCart, path: '/admin/pdv' },
  { label: 'Histórico de Vendas', icon: History, path: '/admin/vendas' },
  { label: 'Estoque', icon: Boxes, path: '/admin/estoque', alert: 'estoque' as const },
  { label: 'Financeiro', icon: DollarSign, path: '/admin/financial' },
  { label: 'CRM Comercial', icon: Kanban, path: '/admin/crm' },
  { label: 'Catálogo do Site', icon: Package, path: '/admin/products' },
  { label: 'Imagens do Site', icon: Image, path: '/admin/site-imagens' },
  { label: 'Banner Promocional', icon: Megaphone, path: '/admin/banner' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estoqueAlerts, setEstoqueAlerts] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (localStorage.getItem('sinho_admin') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  // Realtime de alertas de estoque
  useEffect(() => {
    const fetchAlerts = async () => {
      const { count } = await supabase
        .from('produtos')
        .select('id', { count: 'exact', head: true })
        .in('estoque_status', ['baixo', 'esgotado']);
      setEstoqueAlerts(count || 0);
    };
    fetchAlerts();
    const ch = supabase
      .channel('estoque_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, fetchAlerts)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sinho_admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gradient-gold">Sinho Admin</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map(item => {
            const active = location.pathname === item.path;
            const showBadge = item.alert === 'estoque' && estoqueAlerts > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors relative ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">{estoqueAlerts}</Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Home className="w-4 h-4" /> Ver Site
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm text-muted-foreground">
              {sidebarItems.find(i => i.path === location.pathname)?.label || 'Painel'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden md:inline">
            {now.toLocaleString('pt-BR')}
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
