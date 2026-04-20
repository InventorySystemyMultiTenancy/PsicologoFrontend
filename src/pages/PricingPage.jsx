import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import {
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  updatePricingRule,
} from '../services/api'
import { formatCurrency } from '../utils/currency'

const initialForm = {
  id: null,
  startHour: '08:00',
  endHour: '12:00',
  price: 100,
}

export default function PricingPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    async function loadPricingRules() {
      try {
        setLoading(true)
        const response = await getPricingRules()
        setRules(Array.isArray(response) ? response : response?.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPricingRules()
  }, [])

  function onChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? Number(value) : value }))
  }

  function resetForm() {
    setFormData(initialForm)
  }

  function editRule(rule) {
    setFormData({
      id: rule.id,
      startHour: rule.startHour,
      endHour: rule.endHour,
      price: Number(rule.price),
    })
  }

  async function onSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        startHour: formData.startHour,
        endHour: formData.endHour,
        price: Number(formData.price),
      }

      if (formData.id) {
        const updated = await updatePricingRule(formData.id, payload)
        setRules((prev) => prev.map((item) => (item.id === formData.id ? updated : item)))
      } else {
        const created = await createPricingRule(payload)
        setRules((prev) => [...prev, created])
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
      await deletePricingRule(id)
      setRules((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Configuracao de Preco por Hora"
        subtitle="Defina faixas de horario para calcular automaticamente o valor da consulta."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-5">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">
            {formData.id ? 'Editar Faixa' : 'Nova Faixa'}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Inicio
                <input
                  type="time"
                  name="startHour"
                  value={formData.startHour}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </label>

              <label className="block text-sm text-slate-600">
                Fim
                <input
                  type="time"
                  name="endHour"
                  value={formData.endHour}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-600">
              Valor da Consulta
              <input
                type="number"
                min="0"
                step="1"
                name="price"
                value={formData.price}
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
                {saving ? 'Salvando...' : formData.id ? 'Salvar Alteracoes' : 'Criar Faixa'}
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
          <h2 className="font-heading text-lg font-semibold text-slate-900">Faixas Cadastradas</h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Carregando faixas...</p>
          ) : rules.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Horario</th>
                    <th className="px-3 py-3 font-medium">Valor</th>
                    <th className="px-3 py-3 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 text-slate-700">
                        {rule.startHour} - {rule.endHour}
                      </td>
                      <td className="px-3 py-3 font-semibold text-brand-700">
                        {formatCurrency(rule.price)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editRule(rule)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(rule.id)}
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
              <EmptyState message="Nenhuma faixa de preco cadastrada ainda." />
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
