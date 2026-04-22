import axios from 'axios'
import api from './api'
import { normalizeTranscriptionResponse } from '../utils/normalizeTranscriptionResponse'
import { mapApiError } from '../utils/mapApiError'

export const TRANSCRIPTION_FILE_ACCEPT =
  '.mp3,.wav,.m4a,.mp4,.aac,.ogg,.webm,audio/*,video/mp4'

export const MAX_AUDIO_FILE_SIZE_BYTES = 500 * 1024 * 1024
const TRANSCRIPTION_TIMEOUT_MS = 180000
const MAX_RETRY_ATTEMPTS = 2

const ALLOWED_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'm4a',
  'mp4',
  'aac',
  'ogg',
  'webm',
])

const ALLOWED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mpga',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/aac',
  'video/mp4',
  'application/octet-stream',
])

function getFileExtension(fileName = '') {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() : ''
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function validateTranscriptionFile(file) {
  if (!file) {
    return 'Selecione um arquivo de audio para continuar.'
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return 'Arquivo maior que 500MB. Selecione um arquivo menor.'
  }

  const extension = getFileExtension(file.name)
  const hasAllowedExtension = ALLOWED_EXTENSIONS.has(extension)
  const hasAllowedMime =
    ALLOWED_MIME_TYPES.has(file.type) ||
    file.type.startsWith('audio/') ||
    file.type.startsWith('video/')

  if (!hasAllowedExtension && !hasAllowedMime) {
    return 'Formato nao suportado. Envie mp3, wav, m4a, mp4, aac, ogg ou webm.'
  }

  return ''
}

export async function uploadTranscriptionAudio(file, onProgress) {
  const formData = new FormData()
  formData.append('audio', file)

  const transcriptionClient = axios.create({
    baseURL: api.defaults.baseURL,
    timeout: TRANSCRIPTION_TIMEOUT_MS,
  })

  let lastMappedError = null

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const { data, status } = await transcriptionClient.post('/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent?.total || typeof onProgress !== 'function') {
            return
          }

          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        },
      })

      const normalized = normalizeTranscriptionResponse(data)

      if (import.meta.env.DEV) {
        console.debug('[transcription] payload completo:', data)
        console.debug('[transcription] analysis final:', normalized.analysis)
        console.debug('[transcription] http status:', status)
      }

      return normalized
    } catch (error) {
      const mapped = mapApiError(error)
      const normalizedPartial = normalizeTranscriptionResponse(error?.response?.data || {})
      mapped.partialResult = normalizedPartial
      lastMappedError = mapped

      if (import.meta.env.DEV) {
        console.debug('[transcription] erro mapeado:', mapped)
      }

      const shouldRetry = mapped.isRetryable && attempt < MAX_RETRY_ATTEMPTS

      if (!shouldRetry) {
        throw mapped
      }

      await wait(700 * (attempt + 1))
    }
  }

  throw (
    lastMappedError || {
      userMessage: 'Nao foi possivel concluir a transcricao agora.',
      technicalMessage: 'Erro desconhecido sem mapeamento final.',
      statusCode: null,
      isRetryable: false,
      partialResult: normalizeTranscriptionResponse({}),
    }
  )
}
