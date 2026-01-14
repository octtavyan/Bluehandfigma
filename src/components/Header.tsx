import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import logoImage from 'figma:asset/e13722fae17f2ce12beb5ca6d76372429e2ea412.png';

export const Header: React.FC = () => {
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current) {
        const target = event.target as HTMLElement;
        // Close if clicking outside the menu panel (but not on the toggle button)
        if (!menuRef.current.contains(target) && !target.closest('button[aria-label="Toggle menu"]')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      // Small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Printuri si Canvas', href: '/tablouri-canvas' },
    { label: 'Personalizate', href: '/configureaza-tablou' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="Bluehand Logo" 
              className="h-6 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Caută..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF] w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6994FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dark backdrop overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-in menu from left */}
      <div 
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
            <img 
              src={logoImage} 
              alt="Bluehand Logo" 
              className="h-6 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-2">
            <Link 
              to="/cart" 
              onClick={() => setIsMenuOpen(false)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6994FF] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Menu Items - Bigger with more spacing */}
        <nav className="px-6 py-6 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block py-4 text-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};