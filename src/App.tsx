import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequirePermission from "@/components/admin/RequirePermission";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CatalogoPage from "./pages/CatalogoPage";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import PDVPage from "./pages/admin/PDVPage";
import VendasHistoricoPage from "./pages/admin/VendasHistoricoPage";
import ProductsPage from "./pages/admin/ProductsPage";
import FinancialPage from "./pages/admin/FinancialPage";
import CrmPage from "./pages/admin/CrmPage";
import EstoquePage from "./pages/admin/EstoquePage";
import SiteImagesPage from "./pages/admin/SiteImagesPage";
import CarrosselPage from "./pages/admin/CarrosselPage";
import BannerPage from "./pages/admin/BannerPage";
import ConfiguracoesPage from "./pages/admin/ConfiguracoesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={
                  <RequirePermission modulo="dashboard"><DashboardPage /></RequirePermission>
                } />
                <Route path="/admin/pdv" element={
                  <RequirePermission modulo="pdv"><PDVPage /></RequirePermission>
                } />
                <Route path="/admin/vendas" element={
                  <RequirePermission modulo="pdv"><VendasHistoricoPage /></RequirePermission>
                } />
                <Route path="/admin/estoque" element={
                  <RequirePermission modulo="estoque"><EstoquePage /></RequirePermission>
                } />
                <Route path="/admin/financial" element={
                  <RequirePermission modulo="financeiro"><FinancialPage /></RequirePermission>
                } />
                <Route path="/admin/crm" element={
                  <RequirePermission modulo="crm"><CrmPage /></RequirePermission>
                } />
                <Route path="/admin/products" element={
                  <RequirePermission modulo="catalogo"><ProductsPage /></RequirePermission>
                } />
                <Route path="/admin/site-imagens" element={
                  <RequirePermission modulo="catalogo"><SiteImagesPage /></RequirePermission>
                } />
                <Route path="/admin/carrossel" element={
                  <RequirePermission modulo="catalogo"><CarrosselPage /></RequirePermission>
                } />
                <Route path="/admin/banner" element={
                  <RequirePermission modulo="catalogo"><BannerPage /></RequirePermission>
                } />
                <Route path="/admin/configuracoes" element={
                  <RequirePermission modulo="configuracoes" levels={["total"]}><ConfiguracoesPage /></RequirePermission>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
