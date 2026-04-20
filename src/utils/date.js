import { format } from 'date-fns'

export function formatDate(dateValue, pattern = 'dd/MM/yyyy') {
  if (!dateValue) {
    return '-'
  }

  return format(new Date(dateValue), pattern)
}

export function toInputDate(dateValue = new Date()) {
  const date = new Date(dateValue)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}
