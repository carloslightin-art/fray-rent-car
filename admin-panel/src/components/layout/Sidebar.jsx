import { NavLink } from 'react-router-dom'
import { FiGrid, FiCalendar, FiUsers, FiTruck, FiSettings, FiGlobe, FiUser, FiFileText, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/reservations', label: 'Reservations', icon: FiCalendar },
    { to: '/clients', label: 'Clients', icon: FiUsers },
    { to: '/vehicles', label: 'Vehicles', icon: FiTruck },
    ...(isOwner ? [{ to: '/users', label: 'Users', icon: FiUser }] : []),
    { to: '/website-content', label: 'Website Content', icon: FiGlobe },
    { to: '/reports', label: 'Reports', icon: FiFileText },
    { to: '/settings', label: 'Settings', icon: FiSettings }
  ]

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 max-w-[85vw] flex-col overflow-y-auto overscroll-contain border-r border-luxuryGold/20 bg-luxuryPanel p-4 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:flex`}
      >
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gold-gradient shadow-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-luxuryGold">Admin</p>
              <p className="text-sm font-semibold text-luxuryText">FRAY RENT CAR</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar navegación"
            className="ghost-btn px-2 py-2 lg:hidden"
            onClick={onClose}
          >
            <FiX size={16} />
          </button>
        </div>

        <nav className="space-y-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-luxuryGold/40 bg-gradient-to-r from-luxuryGold/20 via-luxuryGold/10 to-transparent text-luxuryGold shadow-[inset_0_0_0_1px_rgba(212,175,55,0.08)]'
                    : 'border-transparent text-luxuryText hover:border-luxuryGold/15 hover:bg-luxuryGold/10 hover:text-luxuryGold'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition ${
                      isActive ? 'bg-luxuryGold shadow-[0_0_14px_rgba(212,175,55,0.65)]' : 'bg-transparent'
                    }`}
                  />
                  <Icon
                    size={16}
                    className={isActive ? 'text-luxuryGold' : 'text-luxuryMuted group-hover:text-luxuryGold'}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
