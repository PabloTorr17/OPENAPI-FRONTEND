import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Bienvenido, <span className="font-medium text-gray-700">{user?.nombre}</span>
      </p>

      {/* Tarjetas de resumen — cada rama puede conectar sus datos aquí */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Materias',     value: '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Grupos',       value: '—', color: 'bg-green-50 text-green-700' },
          { label: 'Alumnos',      value: '—', color: 'bg-purple-50 text-purple-700' },
          { label: 'Evaluaciones', value: '—', color: 'bg-orange-50 text-orange-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
