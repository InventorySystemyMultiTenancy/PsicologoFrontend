import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getPricingRules,
  updateAppointment,
} from '../services/api'
import { formatCurrency } from '../utils/currency'
import { formatDate, toInputDate } from '../utils/date'
import { getConsultationPriceByTime } from '../utils/pricing'

const initialForm = {
  id: null,
  patientName: '',
  date: toInputDate(),
  time: '08:00',
  value: 0,
}

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([])
  const [pricingRules, setPricingRules] = useState([])
  const [selectedDate, setSelectedDate] = useState(toInputDate())
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        const [appointmentsResponse, pricingResponse] = await Promise.all([
          getAppointments(),
          getPricingRules(),
        ])

        const appointmentList = Array.isArray(appointmentsResponse)
          ? appointmentsResponse
          : appointmentsResponse?.items || []
        const rulesList = Array.isArray(pricingResponse)
          ? pricingResponse
          : pricingResponse?.items || []

        setAppointments(appointmentList)
        setPricingRules(rulesList)

        setFormData((prev) => ({
          ...prev,
          value: getConsultationPriceByTime(prev.time, rulesList),
        }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const appointmentsByDate = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.date?.slice(0, 10) === selectedDate)
      .sort((a, b) => (a.time > b.time ? 1 : -1))
  }, [appointments, selectedDate])

  function onFormChange(event) {
    const { name, value } = event.target

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]: value,
      }

      if (name === 'time') {
        nextData.value = getConsultationPriceByTime(value, pricingRules)
      }

      return nextData
    })
  }

  function startEditing(appointment) {
    setFormData({
      id: appointment.id,
      patientName: appointment.patientName,
      date: appointment.date?.slice(0, 10),
      time: appointment.time,
      value: Number(appointment.value) || 0,
    })
  }

  function resetForm() {
    setFormData({
      ...initialForm,
      value: getConsultationPriceByTime(initialForm.time, pricingRules),
    })
  }

  async function onSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        patientName: formData.patientName,
        date: formData.date,
        time: formData.time,
        value: Number(formData.value),
      }

      if (formData.id) {
        const updated = await updateAppointment(formData.id, payload)
        setAppointments((prev) =>
          prev.map((item) => (item.id === formData.id ? updated : item)),
        )
      } else {
        const created = await createAppointment(payload)
        setAppointments((prev) => [...prev, created])
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
      await deleteAppointment(id)
      setAppointments((prev) => prev.filter((item) => item.id !== id))
      if (formData.id === id) {
        resetForm()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Agenda de Pacientes"
        subtitle="Organize consultas por dia, com valor automatico baseado no horario."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-5">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-heading text-lg font-semibold text-slate-900">
            {formData.id ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm text-slate-600">
              Nome do Paciente
              <input
                required
                name="patientName"
                value={formData.patientName}
                onChange={onFormChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Data
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={onFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </label>

              <label className="block text-sm text-slate-600">
                Horario
                <input
                  required
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={onFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-600">
              Valor da Consulta
              <input
                readOnly
                name="value"
                value={formatCurrency(formData.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Salvando...' : formData.id ? 'Salvar Alteracoes' : 'Criar Agendamento'}
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Calendario de Consultas</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Carregando agenda...</p>
          ) : appointmentsByDate.length ? (
            <div className="space-y-3">
              {appointmentsByDate.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(appointment.date)} as {appointment.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-brand-700">{formatCurrency(appointment.value)}</p>
                    <button
                      type="button"
                      onClick={() => startEditing(appointment)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(appointment.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhuma consulta para a data selecionada." />
          )}
        </article>
      </div>
    </section>
  )
}
