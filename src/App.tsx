import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequirePermission from "@/components/admin/RequirePermission";
import Index from "./pages/Index";

// Lazy-load para code splitting por rota — reduz o bundle inicial
const NotFound = lazy(() => import("./pages/NotFound"));
const CatalogoPage = lazy(() => import("./pages/CatalogoPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const PDVPage = lazy(() => import("./pages/admin/PDVPage"));
const VendasHistoricoPage = lazy(() => import("./pages/admin/VendasHistoricoPage"));
const ProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const FinancialPage = lazy(() => import("./pages/admin/FinancialPage"));
const CrmPage = lazy(() => import("./pages/admin/CrmPage"));
const EstoquePage = lazy(() => import("./pages/admin/EstoquePage"));
const SiteImagesPage = lazy(() => import("./pages/admin/SiteImagesPage"));
const CarrosselPage = lazy(() => import("./pages/admin/CarrosselPage"));
const BannerPage = lazy(() => import("./pages/admin/BannerPage"));
const ConfiguracoesPage = lazy(() => import("./pages/admin/ConfiguracoesPage"));
const BrandingPage = lazy(() => import("./pages/admin/BrandingPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5min cache
      refetchOnWindowFocus: false,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageFallback />}>
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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
