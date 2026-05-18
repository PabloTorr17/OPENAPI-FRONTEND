import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, Users, GraduationCap, UsersRound,
  Presentation, ClipboardCheck, TrendingUp, ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'
import { materiasService } from '@/services/materias.service'
import { gruposService } from '@/services/grupos.service'
import { alumnosService } from '@/services/alumnos.service'
import { equiposService } from '@/services/equipos.service'
import { exposicionesService } from '@/services/exposiciones.service'

interface NavCard {
  to: string; label: string; description: string
  icon: React.ElementType; accent: string; roles: UserRole[]
}

const NAV_CARDS: NavCard[] = [
  { to: '/materias',     label: 'Materias',     description: 'Administra materias',         icon: BookOpen,       accent: '#e0f2fe', roles: ['admin'] },
  { to: '/grupos',       label: 'Grupos',        description: 'Gestiona grupos por materia', icon: Users,          accent: '#dcfce7', roles: ['admin','docente'] },
  { to: '/alumnos',      label: 'Alumnos',       description: 'Consulta y administra',       icon: GraduationCap,  accent: '#fae8ff', roles: ['admin','docente'] },
  { to: '/equipos',      label: 'Equipos',       description: 'Organiza equipos de trabajo', icon: UsersRound,     accent: '#ffedd5', roles: ['admin','docente','alumno'] },
  { to: '/exposiciones', label: 'Exposiciones',  description: 'Exposiciones registradas',    icon: Presentation,   accent: '#fce7f3', roles: ['admin','docente','alumno'] },
  { to: '/evaluaciones', label: 'Evaluaciones',  description: 'Registra evaluaciones',       icon: ClipboardCheck, accent: 'var(--acid)', roles: ['admin','docente','alumno'] },
]

function StatBox({ label, value, loading }: { label: string; value: number | string; loading?: boolean }) {
  return (
    <div className="bg-white p-5" style={{ border: '3px solid var(--ink)', boxShadow: 'var(--shadow)' }}>
      <div className="font-mono-brut text-[10px] uppercase tracking-widest text-gray-500 mb-2">{label}</div>
      {loading
        ? <div className="h-12 w-20 bg-gray-100 animate-pulse" />
        : <div className="stat-num text-[var(--ink)]">{value}</div>
      }
    </div>
  )
}

export default function DashboardPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate  = useNavigate()
  const role     = user?.rol ?? 'alumno'
  const isAdmin  = role === 'admin'

  const { data: materias,     isLoading: lM  } = useQuery({ queryKey: ['dash-mat'], queryFn: () => materiasService.listar({ page: 0, size: 1 }), enabled: isAdmin })
  const { data: grupos,       isLoading: lG  } = useQuery({ queryKey: ['dash-gru'], queryFn: () => gruposService.listar({ page: 0, size: 1 }), enabled: isAdmin })
  const { data: alumnos,      isLoading: lA  } = useQuery({ queryKey: ['dash-alu'], queryFn: () => alumnosService.listar({ page: 0, size: 1 }), enabled: isAdmin })
  const { data: equipos,      isLoading: lE  } = useQuery({ queryKey: ['dash-eq'],  queryFn: () => equiposService.listar(), enabled: isAdmin })
  const { data: exposiciones, isLoading: lEx } = useQuery({ queryKey: ['dash-exp'], queryFn: () => exposicionesService.listar({ page: 0, size: 100, search: '' }), enabled: isAdmin })

  const proximas = exposiciones?.content?.filter((e) => new Date(e.fecha_exposicion).getTime() > Date.now()) ?? []
  const visible  = NAV_CARDS.filter((c) => c.roles.includes(role))

  return (
    <div className="space-y-10 max-w-5xl">

      {/* Hero */}
      <div className="bg-[var(--ink)] text-[var(--paper)] px-6 py-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        style={{ border: '3px solid var(--ink)', boxShadow: 'var(--shadow-lg)' }}>
        <div>
          <div className="font-mono-brut text-[10px] uppercase tracking-widest text-[var(--acid)] mb-2">— {role.toUpperCase()}</div>
          <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tight leading-none">
            {user?.nombre ?? 'Bienvenido'}
          </h1>
        </div>
        <div className="font-mono-brut text-xs text-gray-400 text-right">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Admin stats */}
      {isAdmin && (
        <section>
          <p className="section-label flex items-center gap-2"><TrendingUp size={11} /> Métricas del sistema</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <StatBox label="Materias"    value={materias?.totalElements ?? 0}                loading={lM} />
            <StatBox label="Grupos"      value={grupos?.totalElements ?? 0}                  loading={lG} />
            <StatBox label="Alumnos"     value={alumnos?.totalElements ?? 0}                 loading={lA} />
            <StatBox label="Equipos"     value={Array.isArray(equipos) ? equipos.length : 0} loading={lE} />
            <StatBox label="Próx. expo." value={lEx ? '…' : proximas.length}                loading={lEx} />
          </div>
        </section>
      )}

      {/* Nav cards */}
      <section>
        <p className="section-label">Acceso rápido</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {visible.map(({ to, label, description, icon: Icon, accent }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group text-left bg-white p-5"
              style={{ border: '3px solid var(--ink)', boxShadow: 'var(--shadow)', transition: 'transform 80ms, box-shadow 80ms, background 80ms' }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translate(-3px,-3px)'; el.style.boxShadow = 'var(--shadow-lg)'; el.style.background = accent }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = 'var(--shadow)'; el.style.background = '#fff' }}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon size={20} strokeWidth={2.5} />
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
              </div>
              <p className="font-display text-xl font-black uppercase tracking-tight leading-none mb-1">{label}</p>
              <p className="text-xs text-gray-500 font-mono-brut">{description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Próximas exposiciones admin */}
      {isAdmin && proximas.length > 0 && (
        <section>
          <p className="section-label">Próximas exposiciones</p>
          <div className="panel">
            {proximas.slice(0, 5).map((ex, i) => (
              <div key={ex.id_exposicion} className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: i < proximas.length - 1 ? '2px solid var(--ink)' : 'none' }}>
                <span className="font-display font-bold uppercase tracking-tight text-sm">{ex.titulo}</span>
                <span className="font-mono-brut text-xs text-gray-500">
                  {new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(ex.fecha_exposicion))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
