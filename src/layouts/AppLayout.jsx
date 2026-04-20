import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  ReceiptText,
  BarChart3,
  AudioLines,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda de Pacientes', icon: CalendarDays },
  { to: '/precos', label: 'Preco por Horario', icon: DollarSign },
  { to: '/custos', label: 'Cadastro de Custos', icon: ReceiptText },
  { to: '/relatorios', label: 'Relatorios', icon: BarChart3 },
  { to: '/reunioes', label: 'Reunioes com Transcricao', icon: AudioLines },
]

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const activeTitle = useMemo(() => {
    const current = navigation.find((item) => item.to === location.pathname)
    return current?.label || 'Dashboard'
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(12,123,179,0.18),_transparent_35%),radial-gradient(circle_at_left,_rgba(14,165,233,0.15),_transparent_45%)]" />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white/95 p-6 shadow-soft backdrop-blur-md transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl font-semibold text-brand-700">
            Clinica SaaS
          </Link>
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              <p className="font-heading text-lg font-semibold text-slate-900">{activeTitle}</p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-brand-100 text-center text-sm font-semibold leading-9 text-brand-700">
                DR
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">Dra. Amanda</p>
                <p className="text-slate-500">Psicologa</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
    </div>
  )
}
