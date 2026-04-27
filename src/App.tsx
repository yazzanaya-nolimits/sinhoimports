import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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
import BannerPage from "./pages/admin/BannerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/pdv" element={<PDVPage />} />
              <Route path="/admin/vendas" element={<VendasHistoricoPage />} />
              <Route path="/admin/estoque" element={<EstoquePage />} />
              <Route path="/admin/financial" element={<FinancialPage />} />
              <Route path="/admin/crm" element={<CrmPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/site-imagens" element={<SiteImagesPage />} />
              <Route path="/admin/banner" element={<BannerPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
