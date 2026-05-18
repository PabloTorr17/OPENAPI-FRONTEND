import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, GraduationCap,
  UsersRound, Presentation, ClipboardCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin','docente','alumno'] },
  { to: '/materias',     label: 'Materias',     icon: BookOpen,        roles: ['admin'] },
  { to: '/grupos',       label: 'Grupos',       icon: Users,           roles: ['admin','docente'] },
  { to: '/alumnos',      label: 'Alumnos',      icon: GraduationCap,   roles: ['admin','docente'] },
  { to: '/equipos',      label: 'Equipos',      icon: UsersRound,      roles: ['admin','docente','alumno'] },
  { to: '/exposiciones', label: 'Exposiciones', icon: Presentation,    roles: ['admin','docente','alumno'] },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck,  roles: ['admin','docente','alumno'] },
]

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const role = user?.rol ?? 'alumno'
  const visible = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside
      className="hidden md:flex flex-col bg-[--ink]"
      style={{ width: 220, borderRight: '3px solid #0a0a0a', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5 py-5"
        style={{ borderBottom: '3px solid #2a2a2a' }}
      >
        <div>
          <div
            className="font-display text-[var(--acid)] text-2xl font-black uppercase tracking-tight leading-none"
          >
            EVAL
          </div>
          <div className="font-mono-brut text-[10px] text-gray-400 tracking-widest mt-0.5">
            SISTEMA
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-5 py-3 text-sm font-display font-bold uppercase tracking-wide transition-colors',
                isActive
                  ? 'bg-[var(--acid)] text-[var(--ink)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              ].join(' ')
            }
          >
            <Icon size={15} strokeWidth={2.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User pill */}
      {user && (
        <div
          className="px-5 py-4"
          style={{ borderTop: '2px solid #2a2a2a' }}
        >
          <div className="font-mono-brut text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            {user.rol}
          </div>
          <div className="font-display text-white text-base font-bold uppercase leading-tight truncate">
            {user.nombre}
          </div>
        </div>
      )}
    </aside>
  )
}
