import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Icon, ShoppingCart, DollarSign, Package, LayoutDashboard,
  LogOut, Menu, X, Home, Kanban, Boxes, Image, Megaphone, History, Settings, Images, Sparkles,
} from '@/components/icons';
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
  { labelKey: 'sidebar.branding',      icon: Sparkles,        path: '/admin/branding',      modulo: 'catalogo' },
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

  const currentLabel = (() => {
    const it = sidebarItems.find(i => i.path === location.pathname);
    return it ? t(it.labelKey) : 'Painel';
  })();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside
        className={`sidebar-themed fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-sidebar-border transform transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-[72px] px-6 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <Link to="/admin/dashboard" className="flex flex-col leading-none">
            <span className="font-serif text-[17px] tracking-[0.2em] whitespace-nowrap text-[hsl(var(--sidebar-foreground))]">
              SINHO <span className="text-accent">IMPORTS</span>
            </span>
            <span className="text-[10px] tracking-[0.28em] uppercase mt-1.5 opacity-70">Painel de gestão</span>
          </Link>
          <button
            className="lg:hidden w-11 h-11 -mr-2 inline-flex items-center justify-center opacity-80 hover:opacity-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav aria-label="Menu do painel" className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {visibleItems.map(item => {
            const active = location.pathname === item.path;
            const showBadge = item.alert === 'estoque' && estoqueAlerts > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`nav-item group flex items-center gap-3 min-h-[44px] px-4 rounded-full text-[14px] tracking-[0.02em] transition-colors ${
                  active ? 'is-active font-medium' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {showBadge && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground border-0">
                    {estoqueAlerts}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 p-4 border-t border-sidebar-border space-y-1">
          {(membro || isPinFallback) && (
            <div className="flex items-center gap-3 px-2 pb-3">
              <span className="w-9 h-9 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center text-sm font-medium uppercase">
                {(membro?.nome ?? 'A').charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.14em] opacity-60">{t('common.loggedAs')}</p>
                <p className="text-sm font-medium truncate">{membro?.nome ?? 'Admin Master (PIN)'}</p>
              </div>
            </div>
          )}
          <Link
            to="/"
            className="nav-item flex items-center gap-3 min-h-[44px] px-4 rounded-full text-sm opacity-75 hover:opacity-100 transition-colors"
          >
            <Home className="w-5 h-5" /> {t('common.seeSite')}
          </Link>
          <button
            type="button"
            className="w-full flex items-center gap-3 min-h-[44px] px-4 rounded-full text-sm text-[#E8857A] hover:bg-white/5 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> {t('common.logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-[72px] border-b border-border flex items-center justify-between px-4 sm:px-6 gap-4 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden w-11 h-11 -ml-2 inline-flex items-center justify-center text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
              <span className="hidden sm:inline">Painel</span>
              <Icon name="chevron_right" className="hidden sm:inline-flex w-4 h-4" />
              <span className="font-medium text-foreground tracking-[0.04em]">{currentLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline tabular-nums">
              {now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <Home className="w-[18px] h-[18px]" /> Ver loja
            </Link>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-auto min-w-0">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
