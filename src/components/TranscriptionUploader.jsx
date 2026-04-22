import { useEffect, useState } from 'react'
import EmptyState from './EmptyState'
import {
  MAX_AUDIO_FILE_SIZE_BYTES,
  TRANSCRIPTION_FILE_ACCEPT,
  uploadTranscriptionAudio,
  validateTranscriptionFile,
} from '../services/transcription'

const EMPTY_ANALYSIS = {
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
  analysisError: '',
}

const INITIAL_RESULT = {
  text: '',
  summary: '',
  analysis: EMPTY_ANALYSIS,
  analysisStatus: 'idle',
  analysisError: '',
}

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
  const [result, setResult] = useState(INITIAL_RESULT)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorTechnicalMessage, setErrorTechnicalMessage] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [progressPhase, setProgressPhase] = useState('idle')
  const [processingStartedAt, setProcessingStartedAt] = useState(null)
  const [isProgressComplete, setIsProgressComplete] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!isLoading || progressPhase !== 'processing' || !processingStartedAt) {
      return undefined
    }

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - processingStartedAt

      let nextProgress = 50

      if (elapsed <= 30000) {
        nextProgress = 50 + (elapsed / 30000) * 30
      } else {
        nextProgress = 80 + ((elapsed - 30000) / 60000) * 19
      }

      setDisplayProgress((prev) => Math.max(prev, Math.min(99, Math.round(nextProgress))))
    }, 450)

    return () => clearInterval(intervalId)
  }, [isLoading, progressPhase, processingStartedAt])

  function onSelectFile(event) {
    const file = event.target.files?.[0] || null

    setSuccessMessage('')
    setResult(INITIAL_RESULT)
    setCanRetry(false)
    setErrorTechnicalMessage('')

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
      setErrorTechnicalMessage('')
      setCanRetry(false)
      setSuccessMessage('')
      setUploadProgress(0)
      setDisplayProgress(0)
      setProgressPhase('uploading')
      setProcessingStartedAt(null)
      setIsProgressComplete(false)

      const response = await uploadTranscriptionAudio(selectedFile, (percent) => {
        setUploadProgress(percent)

        const uploadMappedProgress = Math.min(50, Math.round(percent * 0.5))
        setDisplayProgress((prev) => Math.max(prev, uploadMappedProgress))

        if (percent >= 100) {
          setProgressPhase((prevPhase) => {
            if (prevPhase === 'processing') {
              return prevPhase
            }

            setProcessingStartedAt(Date.now())
            return 'processing'
          })
        }
      })

      setResult(response)
      setDisplayProgress(100)
      setProgressPhase('completed')
      setIsProgressComplete(true)
      setSuccessMessage('Transcricao concluida com sucesso.')
    } catch (error) {
      if (error?.partialResult?.text || error?.partialResult?.summary) {
        setResult((prev) => ({
          ...prev,
          ...error.partialResult,
        }))
      }

      setErrorMessage(
        error?.userMessage ||
          'Nao foi possivel transcrever o arquivo agora. Tente novamente em instantes.',
      )
      setErrorTechnicalMessage(error?.technicalMessage || '')
      setCanRetry(Boolean(error?.isRetryable))
      setProgressPhase('idle')
    } finally {
      setIsLoading(false)
    }
  }

  function onRetry() {
    if (!canRetry || !selectedFile || isLoading) {
      return
    }

    onSend()
  }

  function onClear() {
    setSelectedFile(null)
    setResult(INITIAL_RESULT)
    setErrorMessage('')
    setErrorTechnicalMessage('')
    setCanRetry(false)
    setSuccessMessage('')
    setUploadProgress(0)
    setDisplayProgress(0)
    setProgressPhase('idle')
    setProcessingStartedAt(null)
    setIsProgressComplete(false)
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
            {isLoading ? 'Transcrevendo e analisando...' : 'Enviar para Transcricao'}
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
              <span>
                {progressPhase === 'uploading'
                  ? 'Enviando arquivo...'
                  : 'Processando transcricao e analise...'}
              </span>
              <span>{displayProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  isProgressComplete ? 'bg-emerald-600' : 'bg-brand-700'
                }`}
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        ) : isProgressComplete ? (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-emerald-700">
              <span>Transcricao finalizada</span>
              <span>100%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-full rounded-full bg-emerald-600" />
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p>{errorMessage}</p>
            {canRetry ? (
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tentar novamente
              </button>
            ) : null}
            {errorTechnicalMessage ? (
              <p className="mt-2 text-xs text-rose-700/90">Detalhes tecnicos: {errorTechnicalMessage}</p>
            ) : null}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}
      </article>

      <div className="grid gap-6 xl:grid-cols-1">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">📝 Transcricao</h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.text ? (
              <p className="whitespace-pre-wrap">{result.text}</p>
            ) : (
              <EmptyState message="A transcricao aparecera aqui apos o processamento." />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">🤖 Analise da IA </h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {result.analysis.hasAnalysis ? (
              <div className="space-y-4">
                {result.analysis.kind === 'string' && result.analysis.text ? (
                  <p className="whitespace-pre-wrap">{result.analysis.text}</p>
                ) : null}

                {result.analysis.structured.riskLevel ? (
                  <p>
                    <span className="font-semibold">Nivel de risco:</span>{' '}
                    {result.analysis.structured.riskLevel}
                  </p>
                ) : null}

                {result.analysis.structured.mainThemes.length ? (
                  <div>
                    <p className="font-semibold">Temas principais</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {result.analysis.structured.mainThemes.map((theme, index) => (
                        <li key={`theme-${index}`}>{theme}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.analysis.structured.recommendedNextSteps.length ? (
                  <div>
                    <p className="font-semibold">Proximos passos recomendados</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {result.analysis.structured.recommendedNextSteps.map((step, index) => (
                        <li key={`step-${index}`}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.analysis.structured.clinicalObservations ? (
                  <div>
                    <p className="font-semibold">Observacoes clinicas</p>
                    <p className="mt-2 whitespace-pre-wrap">
                      {result.analysis.structured.clinicalObservations}
                    </p>
                  </div>
                ) : null}

                {result.analysis.structured.warningSigns.length ? (
                  <div>
                    <p className="font-semibold">Sinais de alerta</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {result.analysis.structured.warningSigns.map((warning, index) => (
                        <li key={`warning-${index}`}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : result.analysis.analysisError ? (
              <p className="text-amber-700">
                Analise indisponivel no momento: {result.analysis.analysisError}
              </p>
            ) : result.text ? (
              <p className="text-slate-600">Analise indisponivel no momento.</p>
            ) : (
              <EmptyState message="A analise de IA sera exibida aqui quando for retornada pela API." />
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
