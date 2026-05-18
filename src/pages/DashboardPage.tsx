import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  GraduationCap,
  UsersRound,
  Presentation,
  ClipboardCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'

interface NavCard {
  to: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  roles: UserRole[]
}

const NAV_CARDS: NavCard[] = [
  {
    to: '/materias',
    label: 'Materias',
    description: 'Administra las materias del sistema',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    roles: ['admin'],
  },
  {
    to: '/grupos',
    label: 'Grupos',
    description: 'Gestiona grupos por materia',
    icon: Users,
    color: 'bg-green-50 text-green-700 border-green-100',
    roles: ['admin', 'docente'],
  },
  {
    to: '/alumnos',
    label: 'Alumnos',
    description: 'Consulta y administra alumnos',
    icon: GraduationCap,
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    roles: ['admin', 'docente'],
  },
  {
    to: '/equipos',
    label: 'Equipos',
    description: 'Organiza equipos de trabajo',
    icon: UsersRound,
    color: 'bg-orange-50 text-orange-700 border-orange-100',
    roles: ['admin', 'docente', 'alumno'],
  },
  {
    to: '/exposiciones',
    label: 'Exposiciones',
    description: 'Revisa las exposiciones registradas',
    icon: Presentation,
    color: 'bg-pink-50 text-pink-700 border-pink-100',
    roles: ['admin', 'docente', 'alumno'],
  },
  {
    to: '/evaluaciones',
    label: 'Evaluaciones',
    description: 'Registra y consulta evaluaciones',
    icon: ClipboardCheck,
    color: 'bg-teal-50 text-teal-700 border-teal-100',
    roles: ['admin', 'docente', 'alumno'],
  },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const role = user?.rol ?? 'alumno'

  const visible = NAV_CARDS.filter((card) => card.roles.includes(role))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Bienvenido,{' '}
        <span className="font-medium text-gray-700">{user?.nombre}</span>
        {' '}— accede a las secciones disponibles para tu rol.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(({ to, label, description, icon: Icon, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group text-left rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-150"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border mb-4 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-semibold text-gray-900 mb-1">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}