import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart, DollarSign, Package, Users, BarChart3,
  LogOut, Menu, X, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { label: 'PDV / Vendas', icon: ShoppingCart, path: '/admin/dashboard' },
  { label: 'Produtos', icon: Package, path: '/admin/products' },
  { label: 'Financeiro', icon: DollarSign, path: '/admin/financial' },
  { label: 'Clientes', icon: Users, path: '/admin/clients' },
  { label: 'Relatórios', icon: BarChart3, path: '/admin/reports' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('sinho_admin') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('sinho_admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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
          {sidebarItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
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

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center px-4 gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground">
            {sidebarItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
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
