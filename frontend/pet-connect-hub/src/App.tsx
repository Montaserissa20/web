import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { statsApi, initializeCSRF } from "@/services/api";

// Public pages
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import UserProfile from "./pages/UserProfile";
import FAQ from "./pages/FAQ";
import Announcements from "./pages/Announcements";
import SiteMap from "./pages/SiteMap";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard pages
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import MyListings from "./pages/dashboard/MyListings";
import CreateListing from "./pages/dashboard/CreateListing";
import Favorites from "./pages/dashboard/Favorites";
import Settings from "./pages/dashboard/Settings";
import Messages from "./pages/dashboard/Messages";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminFAQ from "./pages/admin/AdminFAQ";

// Moderator pages
import ModeratorLayout from "./pages/moderator/ModeratorLayout";
import ModeratorPending from "./pages/moderator/ModeratorPending";
import ModeratorReports from "./pages/moderator/ModeratorReports";

const queryClient = new QueryClient();

const App = () => {
  const [csrfReady, setCsrfReady] = useState(false);

  // Initialize CSRF protection first, then track visits
  useEffect(() => {
    let heartbeatInterval: ReturnType<typeof setInterval>;
    let handleVisibilityChange: () => void;

    // Initialize CSRF token first, then start tracking
    initializeCSRF().then(() => {
      setCsrfReady(true);

      // Track immediately on load
      statsApi.trackVisit().catch((err) => {
        console.error("Failed to track visit", err);
      });

      // Heartbeat: track every 2 minutes to keep user online
      heartbeatInterval = setInterval(() => {
        statsApi.trackVisit().catch(() => {});
      }, 2 * 60 * 1000); // 2 minutes

      // Track when user returns to the tab
      handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          statsApi.trackVisit().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
    });

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (handleVisibilityChange) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Main layout routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/animals/:species/:slug" element={<ListingDetail />} />
                  <Route path="/profile/:id" element={<UserProfile />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/sitemap" element={<SiteMap />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                </Route>

                {/* Dashboard routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="listings" element={<MyListings />} />
                  <Route path="listings/create" element={<CreateListing />} />
                  <Route path="listings/edit/:id" element={<CreateListing />} />
                  <Route path="favorites" element={<Favorites />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="messages/:conversationId" element={<Messages />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="listings" element={<AdminListings />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                  <Route path="faq" element={<AdminFAQ />} />
                </Route>

                {/* Moderator routes */}
                <Route path="/moderator" element={<ModeratorLayout />}>
                  <Route index element={<ModeratorPending />} />
                  <Route path="pending" element={<ModeratorPending />} />
                  <Route path="reports" element={<ModeratorReports />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
