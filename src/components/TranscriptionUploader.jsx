import { useState } from 'react'
import EmptyState from './EmptyState'
import {
  MAX_AUDIO_FILE_SIZE_BYTES,
  TRANSCRIPTION_FILE_ACCEPT,
  uploadTranscriptionAudio,
  validateTranscriptionFile,
} from '../services/transcription'

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 MB'
  }

  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

export default function TranscriptionUploader() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState({ text: '', summary: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  function onSelectFile(event) {
    const file = event.target.files?.[0] || null

    setSuccessMessage('')
    setResult({ text: '', summary: '' })

    if (!file) {
      setSelectedFile(null)
      setErrorMessage('')
      return
    }

    const validationError = validateTranscriptionFile(file)

    if (validationError) {
      setSelectedFile(null)
      setErrorMessage(validationError)
      return
    }

    setSelectedFile(file)
    setErrorMessage('')
  }

  async function onSend() {
    if (!selectedFile || isLoading) {
      return
    }

    const validationError = validateTranscriptionFile(selectedFile)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')
      setSuccessMessage('')
      setUploadProgress(0)

      const response = await uploadTranscriptionAudio(selectedFile, setUploadProgress)

      setResult({
        text: response.text || '',
        summary: response.summary || '',
      })
      setSuccessMessage('Transcricao concluida com sucesso.')
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Nao foi possivel transcrever o arquivo agora. Tente novamente em instantes.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function onClear() {
    setSelectedFile(null)
    setResult({ text: '', summary: '' })
    setErrorMessage('')
    setSuccessMessage('')
    setUploadProgress(0)
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-slate-900">Upload de Audio para Transcricao</h2>
        <p className="mt-1 text-sm text-slate-500">
          Formatos suportados: mp3, wav, m4a, mp4, aac, ogg e webm. Tamanho maximo de{' '}
          {Math.round(MAX_AUDIO_FILE_SIZE_BYTES / (1024 * 1024))}MB.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            type="file"
            accept={TRANSCRIPTION_FILE_ACCEPT}
            onChange={onSelectFile}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!selectedFile || isLoading}
            className="rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Transcrevendo...' : 'Enviar para Transcricao'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading && !selectedFile}
            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Limpar
          </button>
        </div>

        {selectedFile ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Arquivo:</span> {selectedFile.name}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Tamanho:</span> {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Enviando arquivo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-700 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}
      </article>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">Texto Transcrito</h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.text ? (
              <p className="whitespace-pre-wrap">{result.text}</p>
            ) : (
              <EmptyState message="A transcricao aparecera aqui apos o processamento." />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">Resumo da Reuniao</h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.summary ? (
              <p className="whitespace-pre-wrap">{result.summary}</p>
            ) : (
              <EmptyState message="O resumo automatico sera exibido aqui." />
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
