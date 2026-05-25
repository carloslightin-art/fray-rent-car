import { FiMenu } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

function Topbar({ onMenuToggle = () => {} }) {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-luxuryGold/20 bg-luxuryPanel px-3 py-2 sm:px-4 sm:py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Abrir navegación"
          className="ghost-btn px-2 py-2 lg:hidden"
          onClick={onMenuToggle}
        >
          <FiMenu size={18} />
        </button>

        <h1 className="text-base sm:text-lg font-semibold text-luxuryText md:text-xl">Panel Interno</h1>
        <p className="hidden text-[10px] text-luxuryMuted sm:block sm:text-xs">Gestión operativa de FRAY RENT CAR</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="min-w-0 text-right">
          <p className="max-w-[116px] text-xs font-medium leading-tight text-luxuryText sm:max-w-none sm:text-sm">
            <span className="block truncate sm:hidden">{user?.name}</span>
            <span className="hidden sm:block">{user?.name}</span>
          </p>
          <p className="text-[10px] sm:text-xs uppercase text-luxuryGold">{user?.role}</p>
        </div>
        <button className="ghost-btn text-[11px] sm:text-xs md:text-sm px-2 sm:px-4 py-1.5" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar
