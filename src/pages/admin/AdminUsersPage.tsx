import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, UserCog as UserIcon, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, AdminUser, UserRole } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
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

  const sendPasswordVerificationEmail = async (userEmail: string, userName: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/send-password-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userEmail,
          userName,
          changedBy: currentUser?.fullName || 'Administrator'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Password verification email sent');
        return { success: true };
      } else {
        // Check if it's a domain verification error (testing mode)
        if (result.isDomainError) {
          console.warn('⚠️ Email in testing mode:', result.userMessage);
          return { success: false, isDomainError: true, message: result.userMessage };
        } else {
          console.warn('⚠️ Failed to send verification email:', result.error);
          return { success: false, isDomainError: false };
        }
      }
    } catch (error: any) {
      console.error('⚠️ Error sending verification email:', error);
      return { success: false, isDomainError: false };
    }
  };

  const handleEditUser = async () => {
    if (editingUser && userForm) {
      console.log('🔄 Starting user update...', { editingUser, userForm });
      
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
      };

      // Only include password if it was changed
      if (userForm.password && userForm.password.trim() !== '') {
        updateData.password = userForm.password;
      }

      console.log('✅ Updating user with data:', updateData);
      updateUser(editingUser.id, updateData);

      // Send verification email if password was changed
      if (passwordChanged && userForm.email) {
        const emailResult = await sendPasswordVerificationEmail(userForm.email, userForm.fullName || editingUser.fullName);
        
        // Check if email was actually sent or skipped (testing mode)
        if (emailResult.success) {
          toast.success('Utilizatorul a fost actualizat cu succes!', {
            description: passwordChanged ? 'Parola a fost schimbată.' : undefined,
            duration: 3000,
          });
        } else {
          toast.success('Utilizatorul a fost actualizat cu succes!', {
            description: 'Parola a fost schimbată.',
            duration: 3000,
          });
        }
      } else {
        toast.success('Utilizatorul a fost actualizat cu succes!');
      }

      setEditingUser(null);
      setUserForm({
        username: '',
        password: '',
        role: 'production',
        fullName: '',
        email: '',
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Nu poți șterge propriul cont!');
      return;
    }

    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
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
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'bg-red-100 text-red-800';
      case 'account-manager': return 'bg-blue-100 text-blue-800';
      case 'production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'Administrator Complet';
      case 'account-manager': return 'Manager Conturi';
      case 'production': return 'Producție';
      default: return role;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'full-admin': return 'Acces complet la toate funcționalitățile';
      case 'account-manager': return 'Validare comenzi noi și mutare în producție';
      case 'production': return 'Gestionare comenzi în producție și livrare';
      default: return '';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Utilizatori</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestionează utilizatorii CMS</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Adaugă Utilizator</span>
        </button>
      </div>

      {/* Users Grid - Mobile: Stack, Desktop: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                {user.role === 'full-admin' ? (
                  <Shield className="w-6 h-6 text-yellow-600" />
                ) : (
                  <UserIcon className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={user.id === currentUser?.id ? 'Editează propriul cont' : 'Editează utilizator'}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg text-gray-900 mb-1">{user.fullName}</h3>
            <p className="text-sm text-gray-600 mb-3">@{user.username}</p>

            <span className={`inline-flex px-3 py-1 text-xs rounded-full mb-3 ${getRoleColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>

            <p className="text-xs text-gray-600 mb-4">{getRoleDescription(user.role)}</p>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <p className="text-gray-600">Email: {user.email}</p>
              {user.id === currentUser?.id && (
                <p className="text-yellow-600 text-xs">⭐ Contul tău</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingUser(null);
                setUserForm({
                  username: '',
                  password: '',
                  role: 'production',
                  fullName: '',
                  email: '',
                });
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Închide"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl text-gray-900 mb-6 pr-8">
              {editingUser ? 'Editează Utilizator' : 'Adaugă Utilizator Nou'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nume Complet *</label>
                <input
                  type="text"
                  value={userForm.fullName || ''}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="Ion Popescu"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="ion@bluehand.ro"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Nume Utilizator *</label>
                <input
                  type="text"
                  value={userForm.username || ''}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="ionpopescu"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Parolă {editingUser ? '(opțional)' : '*'}
                </label>
                <input
                  type="password"
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder={editingUser ? 'Lasă gol pentru a păstra parola actuală' : '••••••••'}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lasă câmpul gol pentru a păstra parola actuală
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Rol *</label>
                <select
                  value={userForm.role || 'production'}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                >
                  <option value="full-admin">Administrator Complet</option>
                  <option value="account-manager">Manager Conturi</option>
                  <option value="production">Producție</option>
                </select>
                <p className="text-xs text-gray-600 mt-2">
                  {getRoleDescription(userForm.role as UserRole)}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  setUserForm({
                    username: '',
                    password: '',
                    role: 'production',
                    fullName: '',
                    email: '',
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={editingUser ? handleEditUser : handleAddUser}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {editingUser ? 'Actualizează' : 'Adaugă'} Utilizator
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};