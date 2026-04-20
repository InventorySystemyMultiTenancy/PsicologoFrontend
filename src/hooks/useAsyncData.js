import { useCallback, useEffect, useState } from 'react'

export function useAsyncData(asyncFn, initialValue) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const run = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError('')
        const result = await asyncFn(...args)
        setData(result)
        return result
      } catch (err) {
        setError(err.message || 'Erro inesperado')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFn],
  )

  useEffect(() => {
    run().catch(() => undefined)
  }, [run])

  return {
    data,
    setData,
    loading,
    error,
    run,
  }
}
