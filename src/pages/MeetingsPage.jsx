import SectionHeader from '../components/SectionHeader'
import TranscriptionUploader from '../components/TranscriptionUploader'

export default function MeetingsPage() {
  return (
    <section>
      <SectionHeader
        title="Reunioes com Transcricao"
        subtitle="Envie um audio da reuniao para obter texto completo e resumo automatico."
      />

      <TranscriptionUploader />
    </section>
  )
}
