import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser, changeUserPassword, toggleUserActive } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, Trash2, X, Users as UsersIcon, Check, XCircle, Key, Shield, ShieldOff } from 'lucide-react'

function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOwner = currentUser?.role === 'owner'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers()
      setUsers(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOwner) {
      setError('No tienes permisos para ver esta sección')
      setLoading(false)
      return
    }
    fetchUsers()
  }, [isOwner])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker',
    is_active: true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOwner) return

    setIsSubmitting(true)
    try {
      if (editingUser) {
        // No enviar password si está vacío en edición
        const data = { ...formData }
        if (!data.password) delete data.password
        await updateUser(editingUser.id, data)
      } else {
        await createUser(formData)
      }
      await fetchUsers()
      resetForm()
    } catch (err) {
      console.error('Error saving user:', err)
      alert(err.response?.data?.message || 'Error al guardar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!isOwner) return

    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    try {
      await deleteUser(id)
      await fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'Error al eliminar el usuario')
    }
  }

  const handleToggleActive = async (id) => {
    if (!isOwner) return

    try {
      await toggleUserActive(id)
      await fetchUsers()
    } catch (err) {
      console.error('Error toggling user:', err)
      alert(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!editingUser || !isOwner) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await changeUserPassword(editingUser.id, passwordData.newPassword)
      alert('Contraseña actualizada correctamente')
      setShowPasswordForm(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error('Error changing password:', err)
      alert(err.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'worker',
      is_active: true
    })
    setEditingUser(null)
    setShowForm(false)
    setShowPasswordForm(false)
    setPasswordData({ newPassword: '', confirmPassword: '' })
  }

  const getRoleLabel = (role) => {
    return role === 'owner' ? 'Administrador' : 'Trabajador'
  }

  const getRoleClass = (role) => {
    return role === 'owner' 
      ? 'bg-purple-500/20 text-purple-400' 
      : 'bg-blue-500/20 text-blue-400'
  }

  if (!isOwner) {
    return (
      <div className="panel-card p-8 text-center">
        <ShieldOff className="w-16 h-16 mx-auto text-luxuryDanger opacity-50" />
        <h2 className="mt-4 text-xl font-semibold text-luxuryText">Acceso Denegado</h2>
        <p className="mt-2 text-luxuryMuted">
          No tienes permisos para gestionar usuarios. Solo el administrador puede acceder a esta sección.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Usuarios</h2>
          <p className="text-sm text-luxuryMuted">Gestión de usuarios y permisos.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="ghost-btn text-sm"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="gold-btn text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-luxuryDanger/30 bg-luxuryDanger/10 p-4">
          <p className="text-luxuryDanger">{error}</p>
          {isOwner && (
            <button onClick={fetchUsers} className="gold-btn mt-2 text-sm">
              Reintentar
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="panel-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-luxuryText">
              {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
            </h3>
            <button type="button" onClick={resetForm} className="text-luxuryMuted hover:text-luxuryText">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Nombre *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-luxury"
                required
                placeholder="Nombre completo"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Email *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-luxury"
                required
                placeholder="email@ejemplo.com"
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">
                Password {editingUser ? '(dejar vacío para mantener)' : '*'}
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input-luxury"
                required={!editingUser}
                minLength={4}
                placeholder={editingUser ? '••••••••' : 'Mínimo 4 caracteres'}
              />
            </div>
            
            {/* Rol */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-luxury"
              >
                <option value="worker">Trabajador</option>
                <option value="owner">Administrador</option>
              </select>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-luxuryGold/30 bg-luxuryPanel text-luxuryGold focus:ring-luxuryGold"
                />
                <span className="text-sm text-luxuryText">Usuario activo</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="gold-btn text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              type="button" 
              onClick={resetForm}
              className="ghost-btn text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {showPasswordForm && editingUser && (
        <form onSubmit={handlePasswordSubmit} className="panel-card space-y-4">
          <h3 className="text-lg font-semibold text-luxuryText">
            Cambiar contraseña: {editingUser.name}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Nueva contraseña</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-luxury"
                required
                minLength={4}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-luxury"
                required
                minLength={4}
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="gold-btn text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowPasswordForm(false)}
              className="ghost-btn text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && !error ? (
        <div className="panel-card p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxuryGold/20">
                <th className="px-4 py-3 text-left text-xs font-medium text-luxuryMuted uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-luxuryMuted uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-luxuryMuted uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-luxuryMuted uppercase tracking-wider">Creado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-luxuryMuted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxuryGold/10">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-luxuryPanel/50 ${!user.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-luxuryGold/20 flex items-center justify-center">
                        <span className="text-luxuryGold font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-luxuryText font-medium">{user.name}</p>
                        <p className="text-sm text-luxuryMuted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-4 h-4" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-sm">
                        <XCircle className="w-4 h-4" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-luxuryMuted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Cambiar contraseña */}
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setShowPasswordForm(true)
                          setShowForm(false)
                        }}
                        className="p-2 text-luxuryMuted hover:text-luxuryGold transition-colors"
                        title="Cambiar contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {/* Toggle activo */}
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`p-2 transition-colors ${user.is_active ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                        title={user.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {user.is_active ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-luxuryMuted hover:text-luxuryGold transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-luxuryMuted hover:text-luxuryDanger transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && !error && (
            <div className="panel-card p-8 text-center">
              <UsersIcon className="w-12 h-12 mx-auto text-luxuryMuted opacity-30" />
              <p className="mt-4 text-luxuryMuted">No hay usuarios registrados.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Users
