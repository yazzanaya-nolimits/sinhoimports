import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart, DollarSign, Package, LayoutDashboard,
  LogOut, Menu, X, Home, Kanban, Boxes, Image, Megaphone, History, Settings, Images,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, type Modulo } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

type NavItem = {
  labelKey: string;
  icon: typeof LayoutDashboard;
  path: string;
  modulo: Modulo;
  levels?: string[];
  alert?: 'estoque';
};

const sidebarItems: NavItem[] = [
  { labelKey: 'sidebar.dashboard',     icon: LayoutDashboard, path: '/admin/dashboard',     modulo: 'dashboard' },
  { labelKey: 'sidebar.pdv',           icon: ShoppingCart,    path: '/admin/pdv',           modulo: 'pdv' },
  { labelKey: 'sidebar.salesHistory',  icon: History,         path: '/admin/vendas',        modulo: 'pdv' },
  { labelKey: 'sidebar.stock',         icon: Boxes,           path: '/admin/estoque',       modulo: 'estoque', alert: 'estoque' },
  { labelKey: 'sidebar.financial',     icon: DollarSign,      path: '/admin/financial',     modulo: 'financeiro' },
  { labelKey: 'sidebar.crm',           icon: Kanban,          path: '/admin/crm',           modulo: 'crm' },
  { labelKey: 'sidebar.catalog',       icon: Package,         path: '/admin/products',      modulo: 'catalogo' },
  { labelKey: 'sidebar.siteImages',    icon: Image,           path: '/admin/site-imagens',  modulo: 'catalogo' },
  { labelKey: 'sidebar.carousel',      icon: Images,          path: '/admin/carrossel',     modulo: 'catalogo' },
  { labelKey: 'sidebar.banner',        icon: Megaphone,       path: '/admin/banner',        modulo: 'catalogo' },
  { labelKey: 'sidebar.settings',      icon: Settings,        path: '/admin/configuracoes', modulo: 'configuracoes', levels: ['total'] },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  useLanguage(); // ativa sincronização do idioma com o membro logado
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estoqueAlerts, setEstoqueAlerts] = useState(0);
  const [now, setNow] = useState(new Date());
  const { user, membro, isPinFallback, hasPermission, signOut, loading } = useAuth();

  // Cleanup defensivo: garante que nenhum padding-top antigo do PromoBanner permaneça
  useEffect(() => {
    document.body.style.paddingTop = '';
  }, []);

  // Auth gate: precisa estar logado (Auth) OU ter PIN fallback
  useEffect(() => {
    if (loading) return;
    if (!user && !isPinFallback) {
      navigate('/admin');
    }
  }, [user, isPinFallback, loading, navigate]);

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

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const visibleItems = sidebarItems.filter((it) => hasPermission(it.modulo, it.levels));

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gradient-surface)' }}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, hsl(0 0% 6%), hsl(0 0% 4%))' }}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-gradient-gold leading-none">Sinho</h2>
            <p className="text-[10px] tracking-[0.25em] text-electric uppercase mt-1">Admin · PDV</p>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {visibleItems.map(item => {
            const active = location.pathname === item.path;
            const showBadge = item.alert === 'estoque' && estoqueAlerts > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                  active
                    ? 'nav-active font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-electric' : 'group-hover:text-primary'}`} />
                <span className="flex-1">{t(item.labelKey)}</span>
                {showBadge && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground pulse-glow border-0">
                    {estoqueAlerts}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2 bg-sidebar/80 backdrop-blur">
          {(membro || isPinFallback) && (
            <div className="px-2 pb-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t('common.loggedAs')}</p>
              <p className="text-sm font-medium truncate">
                {membro?.nome ?? 'Admin Master (PIN)'}
              </p>
            </div>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" /> {t('common.seeSite')}
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> {t('common.logout')}
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 gap-4 bg-card/40 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electric pulse-glow" />
              <span className="text-sm font-medium">
                {(() => { const it = sidebarItems.find(i => i.path === location.pathname); return it ? t(it.labelKey) : 'Painel'; })()}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden md:inline font-mono">
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
