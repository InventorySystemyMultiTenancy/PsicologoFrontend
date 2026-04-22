import { normalizeAnalysis } from './normalizeAnalysis'

function pickText(payload = {}) {
  return typeof payload.text === 'string' ? payload.text : ''
}

function pickSummary(payload = {}) {
  return typeof payload.summary === 'string' ? payload.summary : ''
}

function pickAnalysisSource(payload = {}) {
  if (payload.analysis) {
    return payload.analysis
  }

  if (payload.analysis?.data) {
    return payload.analysis.data
  }

  if (payload.rawAnalysis) {
    return payload.rawAnalysis
  }

  return ''
}

export function normalizeTranscriptionResponse(payload = {}) {
  const analysisSource = pickAnalysisSource(payload)
  const normalizedAnalysis = normalizeAnalysis({
    ...payload,
    analysis: analysisSource,
  })

  const text = pickText(payload)
  const summary = pickSummary(payload)

  const analysisError =
    normalizedAnalysis.analysisError ||
    (typeof payload.analysisError === 'string' ? payload.analysisError : '')

  const analysisStatus =
    payload.analysisStatus ||
    (normalizedAnalysis.hasAnalysis
      ? 'completed'
      : analysisError
        ? 'error'
        : 'not_returned')

  return {
    text,
    summary,
    analysis: normalizedAnalysis,
    analysisStatus,
    analysisError,
    rawPayload: payload,
  }
}
