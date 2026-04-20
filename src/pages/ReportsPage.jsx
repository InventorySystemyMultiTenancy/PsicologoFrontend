import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import KpiCard from '../components/KpiCard'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { getReports } from '../services/api'
import { toInputDate } from '../utils/date'
import { formatCurrency } from '../utils/currency'

const initialReport = {
  grossProfit: 0,
  netProfit: 0,
  totalCosts: 0,
  periodAnalysis: [],
}

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    startDate: toInputDate(new Date(new Date().setDate(1))),
    endDate: toInputDate(),
  })
  const [report, setReport] = useState(initialReport)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchReport(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      const response = await getReports(filters)
      setReport({
        grossProfit: response.grossProfit || 0,
        netProfit: response.netProfit || 0,
        totalCosts: response.totalCosts || 0,
        periodAnalysis: response.periodAnalysis || [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Relatorios"
        subtitle="Acompanhe lucro bruto, lucro liquido e analise de custos por periodo."
      />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={fetchReport}>
          <label className="text-sm text-slate-600">
            Data Inicial
            <input
              required
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, startDate: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="text-sm text-slate-600">
            Data Final
            <input
              required
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, endDate: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Gerando...' : 'Gerar Relatorio'}
            </button>
          </div>
        </form>
      </article>

      {error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <KpiCard title="Lucro Bruto" value={report.grossProfit} />
        <KpiCard title="Lucro Liquido" value={report.netProfit} />
        <KpiCard title="Custos Totais" value={report.totalCosts} />
      </div>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-slate-900">Analise de Custos e Receita</h2>
        <p className="text-sm text-slate-500">Comparativo consolidado para o periodo filtrado</p>

        <div className="mt-4 h-[360px]">
          {report.periodAnalysis.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.periodAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#0c7bb3" radius={[8, 8, 0, 0]} />
                <Bar dataKey="costs" name="Custos" fill="#f97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="net" name="Liquido" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Gere um relatorio para visualizar os dados neste grafico." />
          )}
        </div>
      </article>
    </section>
  )
}
