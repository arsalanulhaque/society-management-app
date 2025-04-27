
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SocietyManagement from "./pages/society-management/SocietyManagement";
import ManagementPanel from "./pages/ManagementPanel";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminTools1 from "./pages/AdminTools1";
import PaymentManagement from "./pages/payment-management/PaymentManagement";
import SystemManagement from "./pages/system-management/SystemManagement";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes with Permission requirements */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermission="CanView">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/society-management"
              element={
                <ProtectedRoute requiredPermission="CanView">
                  <SocietyManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment-management"
              element={
                <ProtectedRoute requiredPermission="CanView">
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-management"
              element={
                <ProtectedRoute requiredPermission="CanView">
                  <SystemManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/finance-management"
              element={
                <ProtectedRoute requiredPermission="CanView">
                  <AdminTools1 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/unauthorized"
              element={
                <Unauthorized />
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
