import { formatCurrency } from '../utils/currency'

export default function KpiCard({ title, value, isCurrency = true, helpText }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-3xl font-semibold text-slate-900">
        {isCurrency ? formatCurrency(value) : value}
      </p>
      {helpText ? <p className="mt-2 text-xs text-slate-500">{helpText}</p> : null}
    </article>
  )
}
