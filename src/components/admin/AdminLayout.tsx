import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { LogOut, Package, Users, UserCog, LayoutDashboard, Menu, X, Ruler, Image, Settings, Database, Monitor, FileText, Activity, DollarSign, Trash2, TrendingUp, Shield, Search, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../hooks/useNotifications';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';
import logoImage from 'figma:asset/e13722fae17f2ce12beb5ca6d76372429e2ea412.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, refreshData } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize notifications hook (monitors for new orders and comments)
  useNotifications();

  // Check for updates when navigating between admin pages
  useEffect(() => {
    const checkForUpdates = async () => {
      // Invalidate cache to force fresh data
      CacheService.invalidate(CACHE_KEYS.ORDERS);
      await refreshData();
    };
    
    checkForUpdates();
  }, [location.pathname]); // Run whenever the route changes

  // Check for updates when tab becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && currentUser) {
        CacheService.invalidate(CACHE_KEYS.ORDERS);
        await refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, refreshData]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['full-admin', 'account-manager', 'production'] },
    { path: '/admin/orders', label: 'Comenzi', icon: Package, roles: ['full-admin', 'account-manager', 'production'] },
    { path: '/admin/clients', label: 'Clienți', icon: Users, roles: ['full-admin', 'account-manager', 'production'] },
    { path: '/admin/heroslides', label: 'Hero Slides', icon: Monitor, roles: ['full-admin', 'account-manager'] },
    { path: '/admin/blog-posts', label: 'Blog Posts', icon: FileText, roles: ['full-admin', 'account-manager'] },
    { path: '/admin/legal-pages', label: 'Pagini Juridice', icon: Shield, roles: ['full-admin', 'account-manager'] },
    { path: '/admin/unsplash', label: 'Unsplash', icon: Search, roles: ['full-admin', 'account-manager'] },
    { path: '/admin/sizes', label: 'Dimensiuni', icon: Ruler, roles: ['full-admin'] },
    { path: '/admin/settings', label: 'Setări', icon: Settings, roles: ['full-admin', 'account-manager'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Bluehand Logo" 
              className="h-6 w-auto"
            />
            <div>
              <h1 className="text-sm">CMS</h1>
              <p className="text-xs text-gray-400">{currentUser?.fullName}</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Slide-in */}
      <div className={`fixed lg:inset-y-0 top-16 bottom-0 lg:top-0 left-0 w-64 bg-gray-900 text-white z-40 transition-transform duration-300 lg:translate-x-0 flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-700 flex-shrink-0">
          <Link to="/">
            <img 
              src={logoImage} 
              alt="Bluehand Logo" 
              className="h-8 w-auto mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          <p className="text-sm text-gray-400 mt-1">{currentUser?.fullName}</p>
          <p className="text-xs text-[#6994FF] capitalize">
            {currentUser?.role.replace('-', ' ')}
          </p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto lg:mt-0 mt-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#6994FF] text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 flex-shrink-0 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Deconectare</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-20 sm:pt-24 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {children}
      </div>
    </div>
  );
};