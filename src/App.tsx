import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Routines from "./pages/Routines";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import { AdminProfessionals } from "./pages/admin/AdminProfessionals";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminResources from "./pages/admin/AdminResources";
import AdminCommunity from "./pages/admin/AdminCommunity";
import { Support } from "./pages/Support";
import Videos from "./pages/Videos";
import Stories from "./pages/Stories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/routines" element={<Routines />} />
                <Route path="/services" element={<Services />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/support" element={<Support />} />
                
                {/* Admin Routes - Secret URL */}
                <Route path="/PFLGMANEGER" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="professionals" element={<AdminProfessionals />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="community" element={<AdminCommunity />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="support" element={<AdminSupport />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;