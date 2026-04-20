import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import EmptyState from '../components/EmptyState'
import { uploadAudio } from '../services/api'

export default function MeetingsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onTranscribe() {
    if (!selectedFile) {
      setError('Selecione um arquivo de audio para continuar.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await uploadAudio(selectedFile)
      setTranscription(response.text || '')
      setSummary(response.summary || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <SectionHeader
        title="Reunioes com Transcricao"
        subtitle="Envie um audio da reuniao para obter texto completo e resumo automatico."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-slate-900">Upload de Audio</h2>
        <p className="mt-1 text-sm text-slate-500">
          Formatos recomendados: .mp3, .wav, .m4a. O processamento depende do backend.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2"
          />
          <button
            type="button"
            onClick={onTranscribe}
            disabled={loading}
            className="rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Transcrevendo...' : 'Transcrever'}
          </button>
        </div>
      </article>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">Texto Transcrito</h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {transcription ? (
              transcription
            ) : (
              <EmptyState message="A transcricao aparecera aqui apos o processamento." />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-lg font-semibold text-slate-900">Resumo da Reuniao</h3>
          <div className="mt-4 min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {summary ? summary : <EmptyState message="O resumo automatico sera exibido aqui." />}
          </div>
        </article>
      </div>
    </section>
  )
}
