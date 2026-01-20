import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { CartProvider } from './context/CartContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { CartReturnToast } from './components/CartReturnToast';
import { ScrollToTop } from './components/ScrollToTop';
import { WhatsAppButton } from './components/WhatsAppButton';
import { initFacebookPixel } from './utils/facebookPixel';
import { imagePreloader } from './services/imagePreloader';
import './utils/migrateDefaultUsers'; // Make migration available globally

// Eager load critical pages for faster initial load
import { HomePage } from './pages/HomePage';

// Lazy load all other pages
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const SupabaseTestPage = lazy(() => import('./pages/SupabaseTestPage'));
const APITestPage = lazy(() => import('./pages/APITestPage'));
const LoginTestPage = lazy(() => import('./pages/LoginTestPage'));
const DebugAuthPage = lazy(() => import('./pages/DebugAuthPage'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage'));
const SupabaseDiagnosticsPage = lazy(() => import('./pages/SupabaseDiagnosticsPage'));
const PHPFilesDownloadPage = lazy(() => import('./pages/PHPFilesDownloadPage'));
const PHPFilesPage = lazy(() => import('./pages/PHPFilesPage'));
const ServerTestPage = lazy(() => import('./pages/ServerTestPage'));
const SimpleConnectionTest = lazy(() => import('./pages/SimpleConnectionTest'));
const ServerSetupGuide = lazy(() => import('./pages/ServerSetupGuide'));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const MulticanvasPage = lazy(() => import('./pages/MulticanvasPage').then(m => ({ default: m.MulticanvasPage })));
const PersonalizedCanvasPage = lazy(() => import('./pages/PersonalizedCanvasPage').then(m => ({ default: m.PersonalizedCanvasPage })));
const TablouriCanvasPage = lazy(() => import('./pages/TablouriCanvasPage').then(m => ({ default: m.TablouriCanvasPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OffersPage = lazy(() => import('./pages/OffersPage').then(m => ({ default: m.OffersPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const SitemapPage = lazy(() => import('./pages/SitemapPage').then(m => ({ default: m.SitemapPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const GDPRPage = lazy(() => import('./pages/GDPRPage').then(m => ({ default: m.GDPRPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage').then(m => ({ default: m.AdminClientsPage })));
const AdminClientDetailPage = lazy(() => import('./pages/admin/AdminClientDetailPage').then(m => ({ default: m.AdminClientDetailPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminSizesPage = lazy(() => import('./pages/admin/AdminSizesPage').then(m => ({ default: m.AdminSizesPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminHeroSlidesPage = lazy(() => import('./pages/admin/AdminHeroSlidesPage').then(m => ({ default: m.AdminHeroSlidesPage })));
const AdminBlogPostsPage = lazy(() => import('./pages/admin/AdminBlogPostsPage').then(m => ({ default: m.AdminBlogPostsPage })));
const AdminBlogPostEditPage = lazy(() => import('./pages/admin/AdminBlogPostEditPage').then(m => ({ default: m.AdminBlogPostEditPage })));
const AdminLegalPagesPage = lazy(() => import('./pages/admin/AdminLegalPagesPage').then(m => ({ default: m.AdminLegalPagesPage })));
const AdminUnsplashPage = lazy(() => import('./pages/admin/AdminUnsplashPage').then(m => ({ default: m.AdminUnsplashPage })));
const AdminDatabaseCheckPage = lazy(() => import('./pages/admin/AdminDatabaseCheckPage').then(m => ({ default: m.AdminDatabaseCheckPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6994FF]"></div>
      <p className="mt-4 text-gray-600">Se încarcă...</p>
    </div>
  </div>
);

// Wrapper to pass sizes from AdminContext to CartProvider
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sizes, frameTypes } = useAdmin();
  return <CartProvider sizes={sizes} frameTypes={frameTypes}>{children}</CartProvider>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdmin();
  
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Disable zoom on mobile by adding viewport meta tag
  React.useEffect(() => {
    // Initialize Facebook Pixel
    initFacebookPixel('1630749871436923');

    // Preload Unsplash images in background for instant display
    // This runs asynchronously and doesn't block the UI
    imagePreloader.preloadUnsplashImages().catch(error => {
      console.error('Image preload failed (non-critical):', error);
    });

    // Add/update viewport meta tag to prevent zoom
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    
    // Prevent double-tap zoom on iOS
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  }, []);

  return (
    <AdminProvider>
      <AppProviders>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" closeButton />
          <Routes>
            {/* Admin Routes - wrapped in Suspense */}
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
            <Route path="/supabase-test" element={<Suspense fallback={<PageLoader />}><SupabaseTestPage /></Suspense>} />
            <Route path="/api-test" element={<Suspense fallback={<PageLoader />}><APITestPage /></Suspense>} />
            <Route path="/login-test" element={<Suspense fallback={<PageLoader />}><LoginTestPage /></Suspense>} />
            <Route path="/debug-auth" element={<Suspense fallback={<PageLoader />}><DebugAuthPage /></Suspense>} />
            <Route path="/diagnostic" element={<Suspense fallback={<PageLoader />}><DiagnosticPage /></Suspense>} />
            <Route path="/supabase-diagnostics" element={<Suspense fallback={<PageLoader />}><SupabaseDiagnosticsPage /></Suspense>} />
            <Route path="/php-files-download" element={<Suspense fallback={<PageLoader />}><PHPFilesDownloadPage /></Suspense>} />
            <Route path="/php-files" element={<Suspense fallback={<PageLoader />}><PHPFilesPage /></Suspense>} />
            <Route path="/server-test" element={<Suspense fallback={<PageLoader />}><ServerTestPage /></Suspense>} />
            <Route path="/simple-connection-test" element={<Suspense fallback={<PageLoader />}><SimpleConnectionTest /></Suspense>} />
            <Route path="/server-setup-guide" element={<Suspense fallback={<PageLoader />}><ServerSetupGuide /></Suspense>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/orders/:orderId" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminOrderDetailPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminClientsPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/clients/:clientId" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminClientDetailPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/sizes" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminSizesPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/heroslides" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminHeroSlidesPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/blog-posts" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminBlogPostsPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/blog-posts/new" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminBlogPostEditPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/blog-posts/edit/:id" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminBlogPostEditPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/legal-pages" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminLegalPagesPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/unsplash" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminUnsplashPage /></Suspense></ProtectedRoute>} />
            <Route path="/admin/database-check" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminDatabaseCheckPage /></Suspense></ProtectedRoute>} />

            {/* Public Routes */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col">
                <CartReturnToast />
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
                    <Route path="/product/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
                    <Route path="/produs/:id" element={<Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>} />
                    <Route path="/multicanvas" element={<Suspense fallback={<PageLoader />}><MulticanvasPage /></Suspense>} />
                    <Route path="/configureaza-tablou" element={<Suspense fallback={<PageLoader />}><PersonalizedCanvasPage /></Suspense>} />
                    <Route path="/tablouri-canvas" element={<Suspense fallback={<PageLoader />}><TablouriCanvasPage /></Suspense>} />
                    <Route path="/tablouri-canvas/:category" element={<Suspense fallback={<PageLoader />}><TablouriCanvasPage /></Suspense>} />
                    <Route path="/cart" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
                    <Route path="/cos" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
                    <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
                    <Route path="/oferte" element={<Suspense fallback={<PageLoader />}><OffersPage /></Suspense>} />
                    <Route path="/blog" element={<Suspense fallback={<PageLoader />}><BlogPage /></Suspense>} />
                    <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPostPage /></Suspense>} />
                    <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
                    <Route path="/harta-site" element={<Suspense fallback={<PageLoader />}><SitemapPage /></Suspense>} />
                    <Route path="/sitemap" element={<Suspense fallback={<PageLoader />}><SitemapPage /></Suspense>} />
                    <Route path="/termeni-si-conditii" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
                    <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
                    <Route path="/gdpr" element={<Suspense fallback={<PageLoader />}><GDPRPage /></Suspense>} />
                    <Route path="/politica-confidentialitate" element={<Suspense fallback={<PageLoader />}><GDPRPage /></Suspense>} />
                    <Route path="/payment-success" element={<Suspense fallback={<PageLoader />}><PaymentSuccessPage /></Suspense>} />
                  </Routes>
                </main>
                <Footer />
                <WhatsAppButton />
              </div>
            } />
          </Routes>
        </Router>
      </AppProviders>
    </AdminProvider>
  );
}

export default App;