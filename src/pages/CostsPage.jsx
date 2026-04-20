import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { createCost, deleteCost, getCosts, updateCost } from '../services/api'
import { formatCurrency } from '../utils/currency'

const initialForm = {
  id: null,
  name: '',
  type: 'fixed',
  amount: 0,
  referenceMonth: '',
}

export default function CostsPage() {
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    async function loadCosts() {
      try {
        setLoading(true)
        const response = await getCosts()
        setCosts(Array.isArray(response) ? response : response?.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCosts()
  }, [])

  const totals = useMemo(() => {
    return costs.reduce(
      (acc, cost) => {
        const amount = Number(cost.amount) || 0

        if (cost.type === 'fixed') {
          acc.fixed += amount
        } else {
          acc.variable += amount
        }

        acc.total += amount
        return acc
      },
      { fixed: 0, variable: 0, total: 0 },
    )
  }, [costs])

  function onChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }))
  }

  function resetForm() {
    setFormData(initialForm)
  }

  function editCost(cost) {
    setFormData({
      id: cost.id,
      name: cost.name,
      type: cost.type,
      amount: Number(cost.amount),
      referenceMonth: cost.referenceMonth || '',
    })
  }

  async function onSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: formData.name,
        type: formData.type,
        amount: Number(formData.amount),
        referenceMonth: formData.referenceMonth,
      }

      if (formData.id) {
        const updated = await updateCost(formData.id, payload)
        setCosts((prev) => prev.map((item) => (item.id === formData.id ? updated : item)))
      } else {
        const created = await createCost(payload)
        setCosts((prev) => [...prev, created])
      }

      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    try {
      setError('')
      await deleteCost(id)
      setCosts((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Cadastro de Custos"
        subtitle="Gerencie custos fixos e variaveis para analisar o lucro liquido da clinica."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Custos Fixos</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totals.fixed)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Custos Variaveis</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totals.variable)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Custos Totais</p>
          <p className="mt-1 text-xl font-semibold text-brand-700">{formatCurrency(totals.total)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">
            {formData.id ? 'Editar Custo' : 'Novo Custo'}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-slate-600">
              Descricao
              <input
                required
                name="name"
                value={formData.name}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Tipo
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                <option value="fixed">Fixo</option>
                <option value="variable">Variavel</option>
              </select>
            </label>

            <label className="block text-sm text-slate-600">
              Valor
              <input
                required
                min="0"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Mes de Referencia
              <input
                type="month"
                name="referenceMonth"
                value={formData.referenceMonth}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Salvando...' : formData.id ? 'Salvar Alteracoes' : 'Criar Custo'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Limpar
              </button>
            </div>
          </form>
        </article>

        <article className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Lista de Custos</h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Carregando custos...</p>
          ) : costs.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Descricao</th>
                    <th className="px-3 py-3 font-medium">Tipo</th>
                    <th className="px-3 py-3 font-medium">Mes</th>
                    <th className="px-3 py-3 font-medium">Valor</th>
                    <th className="px-3 py-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr key={cost.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 text-slate-700">{cost.name}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {cost.type === 'fixed' ? 'Fixo' : 'Variavel'}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{cost.referenceMonth || '-'}</td>
                      <td className="px-3 py-3 font-semibold text-brand-700">
                        {formatCurrency(cost.amount)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editCost(cost)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(cost.id)}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState message="Nenhum custo cadastrado ainda." />
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
