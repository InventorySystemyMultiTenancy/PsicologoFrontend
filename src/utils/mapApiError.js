export function mapApiError(error) {
  const statusCode = error?.response?.status || null
  const payload = error?.response?.data || null

  const backendMessage =
    payload?.message ||
    payload?.error ||
    payload?.detail ||
    payload?.title ||
    ''

  const isCanceled =
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    String(error?.message || '').toLowerCase().includes('canceled')

  const isTimeout =
    error?.code === 'ECONNABORTED' ||
    String(error?.message || '').toLowerCase().includes('timeout')

  const hasNoResponse = !error?.response && !isCanceled
  const isNetworkError = hasNoResponse || error?.message === 'Network Error'

  let userMessage =
    'Nao foi possivel concluir a transcricao agora. Tente novamente em instantes.'

  if (isTimeout) {
    userMessage =
      'A transcricao demorou mais que o esperado. Tente novamente com um audio menor ou aguarde alguns minutos.'
  } else if (isCanceled) {
    userMessage =
      'A requisicao de transcricao foi cancelada no cliente antes da conclusao.'
  } else if (isNetworkError) {
    userMessage =
      'Falha de rede ao enviar o audio. Verifique sua conexao e tente novamente.'
  } else if (statusCode && statusCode >= 400 && statusCode < 500) {
    userMessage =
      backendMessage ||
      'A API recusou a requisicao de transcricao. Revise os dados enviados e tente novamente.'
  } else if (statusCode && statusCode >= 500) {
    userMessage =
      backendMessage ||
      'Erro interno no servidor durante a transcricao. Tente novamente em instantes.'
  }

  const isRetryable =
    isTimeout || isNetworkError || ((statusCode || 0) >= 500 && (statusCode || 0) < 600)

  const technicalMessage = [
    `status=${statusCode || 'none'}`,
    `code=${error?.code || 'none'}`,
    `message=${error?.message || 'none'}`,
    backendMessage ? `backend=${backendMessage}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  return {
    userMessage,
    technicalMessage,
    statusCode,
    isRetryable,
    isTimeout,
    isCanceled,
    isNetworkError,
    backendMessage,
    errorPayload: payload,
  }
}
