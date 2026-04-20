export function formatCurrency(value) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}
