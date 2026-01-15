import React, { useState } from 'react';
import { useAdmin, AdminUser, UserRole } from '../../context/AdminContext';
import { UserPlus, Pencil, Trash2, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export const UserManagementTab: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'production',
    isActive: true,
  });

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't show existing password
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'production',
        isActive: true,
      });
    }
    setShowModal(true);
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'production',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Completează toate câmpurile obligatorii');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('Parola este obligatorie pentru utilizatori noi');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updates: Partial<AdminUser> = {
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };

        // Only update password if a new one was provided
        if (formData.password.trim()) {
          updates.password = formData.password;
        }

        await updateUser(editingUser.id, updates);
        toast.success('Utilizator actualizat cu succes!');
      } else {
        // Create new user
        await addUser({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
        toast.success('Utilizator adăugat cu succes!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Eroare la salvarea utilizatorului');
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      toast.error('Nu poți șterge propriul cont!');
      return;
    }

    if (!confirm(`Sigur vrei să ștergi utilizatorul "${user.fullName}"?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.success('Utilizator șters cu succes!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Eroare la ștergerea utilizatorului');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'full-admin':
        return 'bg-purple-100 text-purple-700';
      case 'account-manager':
        return 'bg-blue-100 text-blue-700';
      case 'production':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'full-admin':
        return 'Full Admin';
      case 'account-manager':
        return 'Account Manager';
      case 'production':
        return 'Producție';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl text-gray-900">Utilizatori Admin</h2>
          <p className="text-sm text-gray-600 mt-1">{users.length} utilizatori în sistem</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Adaugă Utilizator</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Nume</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Username</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Rol</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.username}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Activ
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Inactiv
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editează"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Șterge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Editează Utilizator' : 'Adaugă Utilizator Nou'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume Complet *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: Ion Popescu"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: ipopescu"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: ion@bluehand.ro"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parolă {editingUser ? '(lasă gol pentru a păstra cea existentă)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-10"
                    placeholder={editingUser ? 'Lasă gol pentru a păstra' : 'Minim 6 caractere'}
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="production">Producție</option>
                  <option value="account-manager">Account Manager</option>
                  <option value="full-admin">Full Admin</option>
                </select>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <div className="flex items-start space-x-1">
                    <Shield className="w-3 h-3 text-green-600 mt-0.5" />
                    <span><strong>Producție:</strong> Acces la comenzi și producție</span>
                  </div>
                  <div className="flex items-start space-x-1">
                    <Shield className="w-3 h-3 text-blue-600 mt-0.5" />
                    <span><strong>Account Manager:</strong> + Comenzi, clienți, financiare, conținut</span>
                  </div>
                  <div className="flex items-start space-x-1">
                    <Shield className="w-3 h-3 text-purple-600 mt-0.5" />
                    <span><strong>Full Admin:</strong> Acces complet la toate funcțiile</span>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Utilizator activ (poate accesa sistemul)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Actualizează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
