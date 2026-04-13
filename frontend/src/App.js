import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ComplaintProvider } from "./context/ComplaintContext";
import { APP_ROLES, getDefaultRouteForRole } from "./utils/roles";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AcademicPage from "./pages/AcademicPage";
import RestaurantSelectPage from "./pages/RestaurantSelectPage";
import FoodPage from "./pages/FoodPage";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import LaundryPage from "./pages/LaundryPage";
import LaundryDashboardPage from "./pages/LaundryDashboardPage";
import ComplaintPage from "./pages/ComplaintPage";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";

function ProtectedLayout({ children }) {
  const { user } = useAuth();

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.65)), url(/bennett.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <div className="app-container" style={backgroundStyle}>
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar user={user} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const appRole = user.appRole || APP_ROLES.USER;
  if (!allowedRoles.includes(appRole)) {
    return <Navigate to={getDefaultRouteForRole(user)} replace />;
  }

  return children;
}

export default function App() {
  const { user, login, isLoading, error: authError } = useAuth();

  if (!user) {
    return <LoginPage onLogin={login} isLoading={isLoading} authError={authError} />;
  }

  const defaultRoute = getDefaultRouteForRole(user);

  return (
    <ComplaintProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          <Route
            path="/home"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <HomePage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/academic"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <AcademicPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/food"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <RestaurantSelectPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/food/:restaurant"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <FoodPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/restaurant/dashboard"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.RESTAURANT]}>
                <ProtectedLayout>
                  <RestaurantDashboard />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route path="/restaurant-dashboard/:restaurant" element={<Navigate to="/restaurant/dashboard" replace />} />
          <Route
            path="/laundry"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <LaundryPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/laundry/dashboard"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.LAUNDRY]}>
                <ProtectedLayout>
                  <LaundryDashboardPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/complaint"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER]}>
                <ProtectedLayout>
                  <ComplaintPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/complaint/:id"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.USER, APP_ROLES.ADMIN]}>
                <ProtectedLayout>
                  <ComplaintDetailsPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allowedRoles={[APP_ROLES.ADMIN]}>
                <ProtectedLayout>
                  <AdminPage />
                </ProtectedLayout>
              </RoleGuard>
            }
          />
<Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </Router>
    </ComplaintProvider>
  );
}
