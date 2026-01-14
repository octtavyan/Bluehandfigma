import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, UserCog as UserIcon, X } from 'lucide-react';
import { useAdmin, AdminUser, UserRole } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

export const AdminUsersContent: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAdmin();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<Partial<AdminUser>>({
    username: '',
    password: '',
    role: 'production',
    fullName: '',
    email: '',
  });

  const handleAddUser = async () => {
    if (!userForm.username || !userForm.password || !userForm.fullName || !userForm.email) {
      toast.error('Te rugăm să completezi toate câmpurile obligatorii');
      return;
    }

    // Validate email domain
    if (!userForm.email.endsWith('@bluehand.ro')) {
      toast.error('Emailul trebuie să fie de la domeniul @bluehand.ro');
      return;
    }

    addUser({
      username: userForm.username,
      password: userForm.password,
      role: userForm.role as UserRole,
      fullName: userForm.fullName,
      email: userForm.email,
    });

    setShowAddModal(false);
    setUserForm({
      username: '',
      password: '',
      role: 'production',
      fullName: '',
      email: '',
    });
    toast.success('Utilizatorul a fost adăugat cu succes!');
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-verification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('⚠️ Email sending failed:', errorData);
        
        if (errorData.error && errorData.error.includes('Invalid domain')) {
          return { success: false, isDomainError: true };
        }
        return { success: false, isDomainError: false };
      }

      const data = await response.json();
      return { success: true, isDomainError: false };
    } catch (error: any) {
      console.error('⚠️ Error sending verification email:', error);
      return { success: false, isDomainError: false };
    }
  };

  const handleEditUser = async () => {
    if (editingUser && userForm) {
      // Validate required fields (password is optional when editing)
      if (!userForm.fullName || !userForm.email || !userForm.username) {
        toast.error('Te rugăm să completezi toate câmpurile obligatorii');
        return;
      }

      // Validate email format (removed @bluehand.ro requirement for more flexibility)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        toast.error('Te rugăm să introduci un email valid');
        return;
      }

      // Check if password was changed
      const passwordChanged = userForm.password && userForm.password !== editingUser.password;

      // Prepare update data - only include password if it was changed
      const updateData: Partial<AdminUser> = {
        username: userForm.username,
        role: userForm.role,
        fullName: userForm.fullName,
        email: userForm.email,
        isActive: userForm.isActive,
      };

      if (passwordChanged) {
        updateData.password = userForm.password;
      }

      await updateUser(editingUser.id, updateData);

      setEditingUser(null);
      setUserForm({
        username: '',
        password: '',
        role: 'production',
        fullName: '',
        email: '',
      });
      toast.success('Utilizatorul a fost actualizat cu succes!');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Nu poți șterge propriul cont!');
      return;
    }

    if (confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      deleteUser(userId);
      toast.success('Utilizatorul a fost șters cu succes!');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: user.password,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      role: 'production',
      fullName: '',
      email: '',
    });
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'Administrator Complet';
      case 'account-manager': return 'Manager Cont';
      case 'production': return 'Producție';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'bg-red-100 text-red-700';
      case 'account-manager': return 'bg-blue-100 text-blue-700';
      case 'production': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'Acces complet la toate funcționalitățile';
      case 'account-manager': return 'Gestionare comenzi, clienți și financiare';
      case 'production': return 'Gestionare comenzi în producție și livrare';
      default: return '';
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl text-gray-900 mb-2">Utilizatori CMS</h2>
          <p className="text-sm sm:text-base text-gray-600">{users.length} utilizatori înregistrați</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm sm:text-base"
        >
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Adaugă Utilizator
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Utilizator</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isActive ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-gray-900">{editingUser ? 'Editează Utilizator' : 'Adaugă Utilizator Nou'}</h3>
              <button onClick={closeModal} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nume Complet *</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Ion Popescu"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: ion.popescu@bluehand.ro"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: ionpopescu"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Parolă {editingUser ? '(lasă gol pentru a păstra parola curentă)' : '*'}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Rol *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                >
                  <option value="production">Producție</option>
                  <option value="account-manager">Manager Cont</option>
                  <option value="full-admin">Administrator Complet</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{getRoleDescription(userForm.role as UserRole)}</p>
              </div>

              {editingUser && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <label className="text-sm text-gray-700">Utilizator Activ</label>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={editingUser ? handleEditUser : handleAddUser}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {editingUser ? 'Salvează' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};