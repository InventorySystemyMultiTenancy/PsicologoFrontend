import axios from 'axios'

const api = axios.create({
  baseURL: 'https://SEU_BACKEND_RENDER_URL',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'Nao foi possivel concluir a operacao. Tente novamente.'

    return Promise.reject(new Error(message))
  },
)

export async function getDashboard(params = {}) {
  const { data } = await api.get('/dashboard', { params })
  return data
}

export async function getAppointments(params = {}) {
  const { data } = await api.get('/appointments', { params })
  return data
}

export async function createAppointment(payload) {
  const { data } = await api.post('/appointments', payload)
  return data
}

export async function updateAppointment(id, payload) {
  const { data } = await api.put(`/appointments/${id}`, payload)
  return data
}

export async function deleteAppointment(id) {
  const { data } = await api.delete(`/appointments/${id}`)
  return data
}

export async function getPricingRules() {
  const { data } = await api.get('/pricing-rules')
  return data
}

export async function createPricingRule(payload) {
  const { data } = await api.post('/pricing-rules', payload)
  return data
}

export async function updatePricingRule(id, payload) {
  const { data } = await api.put(`/pricing-rules/${id}`, payload)
  return data
}

export async function deletePricingRule(id) {
  const { data } = await api.delete(`/pricing-rules/${id}`)
  return data
}

export async function getCosts(params = {}) {
  const { data } = await api.get('/costs', { params })
  return data
}

export async function createCost(payload) {
  const { data } = await api.post('/costs', payload)
  return data
}

export async function updateCost(id, payload) {
  const { data } = await api.put(`/costs/${id}`, payload)
  return data
}

export async function deleteCost(id) {
  const { data } = await api.delete(`/costs/${id}`)
  return data
}

export async function getReports(params = {}) {
  const { data } = await api.get('/reports', { params })
  return data
}

export async function uploadAudio(file) {
  const formData = new FormData()
  formData.append('audio', file)

  const { data } = await api.post('/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

export default api
