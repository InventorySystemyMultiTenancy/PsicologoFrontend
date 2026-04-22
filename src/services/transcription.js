import api from './api'
import { normalizeAnalysis } from '../utils/normalizeAnalysis'

export const TRANSCRIPTION_FILE_ACCEPT =
  '.mp3,.wav,.m4a,.mp4,.aac,.ogg,.webm,audio/*,video/mp4'

export const MAX_AUDIO_FILE_SIZE_BYTES = 50 * 1024 * 1024

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

export function validateTranscriptionFile(file) {
  if (!file) {
    return 'Selecione um arquivo de audio para continuar.'
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return 'Arquivo maior que 50MB. Selecione um arquivo menor.'
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

  try {
    const { data } = await api.post('/transcribe', formData, {
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

    const normalizedAnalysis = normalizeAnalysis(data)

    // Debug temporario para inspecionar variações de payload do backend/n8n.
    console.debug('[transcription] payload completo:', data)
    console.debug('[transcription] analysis normalizado:', normalizedAnalysis)

    return {
      text: data?.text || '',
      summary: data?.summary || '',
      analysis: normalizedAnalysis,
      raw: data,
    }
  } catch (error) {
    if (error.message === 'Network Error') {
      throw new Error('Falha de conexao com o backend. Verifique a URL da API.')
    }

    throw error
  }
}
