import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import logoImage from 'figma:asset/e13722fae17f2ce12beb5ca6d76372429e2ea412.png';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username, password, rememberMe);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Nume utilizator sau parolă incorectă');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center mx-auto mb-4">
              <img 
                src={logoImage} 
                alt="Bluehand Logo" 
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </Link>
            <h2 className="text-2xl text-gray-900 mb-2">Panou de Administrare</h2>
            <p className="text-gray-600 text-sm">Autentificare CMS</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nume Utilizator</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#86C2FF] focus:outline-none"
                  placeholder="Introduceți numele de utilizator"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Parolă</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#86C2FF] focus:outline-none"
                  placeholder="Introduceți parola"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#86C2FF] border-gray-300 rounded focus:ring-[#86C2FF]"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Ține-mă minte
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors shadow-lg"
            >
              Autentificare
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">ConturiDemo:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Account Manager:</strong> account / account123</p>
              <p><strong>Production:</strong> production / production123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};