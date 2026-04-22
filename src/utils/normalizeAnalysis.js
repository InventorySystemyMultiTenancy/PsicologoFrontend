function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function normalizeStringArray(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
      .filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

function extractStructuredAnalysis(source) {
  if (!isObject(source)) {
    return {
      riskLevel: '',
      mainThemes: [],
      recommendedNextSteps: [],
      clinicalObservations: '',
      warningSigns: [],
    }
  }

  return {
    riskLevel: pickFirstString(source.riskLevel, source.risk, source.severity, source.level),
    mainThemes: normalizeStringArray(source.mainThemes || source.themes || source.mainTopics),
    recommendedNextSteps: normalizeStringArray(
      source.recommendedNextSteps || source.recommendations || source.nextSteps,
    ),
    clinicalObservations: pickFirstString(
      source.clinicalObservations,
      source.observations,
      source.clinicalNotes,
    ),
    warningSigns: normalizeStringArray(source.warningSigns || source.warnings || source.redFlags),
  }
}

function hasStructuredContent(structured) {
  return Boolean(
    structured.riskLevel ||
      structured.mainThemes.length ||
      structured.recommendedNextSteps.length ||
      structured.clinicalObservations ||
      structured.warningSigns.length,
  )
}

export function normalizeAnalysis(payload = {}) {
  const analysisError = pickFirstString(payload.analysisError, payload.analysis_error)

  let analysisSource = payload.analysis

  if ((!analysisSource || analysisSource === '') && payload.rawAnalysis) {
    analysisSource = payload.rawAnalysis
  }

  if (isObject(analysisSource) && analysisSource.data) {
    analysisSource = analysisSource.data
  }

  if (typeof analysisSource === 'string') {
    const text = analysisSource.trim()

    return {
      kind: text ? 'string' : 'empty',
      text,
      structured: {
        riskLevel: '',
        mainThemes: [],
        recommendedNextSteps: [],
        clinicalObservations: '',
        warningSigns: [],
      },
      hasAnalysis: Boolean(text),
      analysisError,
    }
  }

  if (isObject(analysisSource)) {
    const structured = extractStructuredAnalysis(analysisSource)
    const fallbackText = pickFirstString(
      analysisSource.text,
      analysisSource.analysis,
      analysisSource.description,
    )

    return {
      kind: hasStructuredContent(structured) ? 'object' : fallbackText ? 'string' : 'empty',
      text: fallbackText,
      structured,
      hasAnalysis: hasStructuredContent(structured) || Boolean(fallbackText),
      analysisError,
    }
  }

  return {
    kind: 'empty',
    text: '',
    structured: {
      riskLevel: '',
      mainThemes: [],
      recommendedNextSteps: [],
      clinicalObservations: '',
      warningSigns: [],
    },
    hasAnalysis: false,
    analysisError,
  }
}
