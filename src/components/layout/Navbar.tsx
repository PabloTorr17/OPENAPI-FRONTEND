import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const user    = useAuthStore((s) => s.user)
  const logout  = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <header
      className="flex h-14 items-center justify-between bg-white px-4 md:px-6"
      style={{ borderBottom: '3px solid var(--ink)' }}
    >
      {/* Mobile brand */}
      <div className="flex items-center gap-3 md:hidden">
        <Menu size={20} />
        <span className="font-display text-xl font-black uppercase tracking-tight">EVAL</span>
      </div>

      {/* Desktop: breadcrumb placeholder */}
      <div className="hidden md:block" />

      {/* Right */}
      <div className="flex items-center gap-3">
        {user && (
          <span
            className="hidden sm:block font-mono-brut text-[11px] uppercase tracking-widest text-gray-500"
          >
            {user.email || user.nombre}
          </span>
        )}

        <button
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="btn btn-ghost btn-sm flex items-center gap-1.5"
        >
          <LogOut size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
