import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import KpiCard from '../components/KpiCard'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { useAsyncData } from '../hooks/useAsyncData'
import { getDashboard } from '../services/api'
import { formatCurrency } from '../utils/currency'

const COLORS = ['#0c7bb3', '#33a0d0', '#89c7e8', '#bfdff0']

const dashboardInitialState = {
  grossProfit: 0,
  netProfit: 0,
  totalCosts: 0,
  totalAppointments: 0,
  revenueByMonth: [],
  costsByCategory: [],
}

export default function DashboardPage() {
  const { data, loading, error } = useAsyncData(getDashboard, dashboardInitialState)

  return (
    <section>
      <SectionHeader
        title="Dashboard"
        subtitle="Visao geral financeira da clinica com foco em lucro, custos e consultas."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Lucro Bruto" value={data.grossProfit} />
        <KpiCard title="Lucro Liquido" value={data.netProfit} />
        <KpiCard title="Custos Totais" value={data.totalCosts} />
        <KpiCard
          title="Numero de Consultas"
          value={data.totalAppointments || 0}
          isCurrency={false}
          helpText="Periodo atual"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Evolucao de Receita</h2>
          <p className="text-sm text-slate-500">Analise mensal de entrada financeira</p>

          <div className="mt-4 h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Carregando dados...
              </div>
            ) : data.revenueByMonth?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueByMonth}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c7bb3" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0c7bb3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0c7bb3"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Sem dados de receita para o periodo selecionado." />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Custos por Categoria</h2>
          <p className="text-sm text-slate-500">Distribuicao entre custos fixos e variaveis</p>

          <div className="mt-4 h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Carregando dados...
              </div>
            ) : data.costsByCategory?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.costsByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {data.costsByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Sem custos cadastrados para analise." />
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
