export function parseHourToMinutes(hourString) {
  if (!hourString || !hourString.includes(':')) {
    return 0
  }

  const [hour, minute] = hourString.split(':').map(Number)
  return hour * 60 + minute
}

export function getConsultationPriceByTime(time, pricingRules = []) {
  const selectedMinutes = parseHourToMinutes(time)

  const matchedRule = pricingRules.find((rule) => {
    const start = parseHourToMinutes(rule.startHour)
    const end = parseHourToMinutes(rule.endHour)
    return selectedMinutes >= start && selectedMinutes < end
  })

  if (!matchedRule) {
    return 0
  }

  return Number(matchedRule.price) || 0
}
