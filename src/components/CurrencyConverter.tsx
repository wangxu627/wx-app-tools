import { useState, useEffect, useCallback } from 'react'
import { Title, Text, Loader, Alert } from '@mantine/core'

interface CurrencyConverterProps {
  className?: string
}

export default function CurrencyConverter({ className }: CurrencyConverterProps) {
  const USD_AMOUNTS = [100, 200, 300, 500, 700, 1000]
  const CNY_AMOUNTS = [1000, 2000, 3000, 5000, 7000, 10000]

  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRate = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const API_KEY = (import.meta.env.VITE_EXCHANGE_API_KEY as string) || '72c27d76daf2471ab3620d9dca48b832'
      const API_URL = (import.meta.env.VITE_EXCHANGE_API_URL as string) || 'https://api.currencyfreaks.com/v2.0/rates/latest'

      let baseUrl = ''
      let url = ''
      if (API_KEY) {
        baseUrl = API_URL || 'https://api.currencyfreaks.com/v2.0/rates/latest'
        url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}apikey=${API_KEY}&symbols=CNY&base=USD`
      } else {
        baseUrl = API_URL || 'https://api.exchangerate.host/latest'
        url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}base=USD&symbols=CNY`
      }

      const res = await fetch(url, { signal })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const msg = json?.error?.info ?? json?.message ?? json?.info ?? `HTTP ${res.status}`
        if (typeof msg === 'string' && /access_key|missing_access_key|API Access Key/i.test(msg)) {
          throw new Error('Missing API key: set VITE_EXCHANGE_API_KEY in your .env (or use exchangerate.host as fallback).')
        }
        throw new Error(`Failed to fetch rates: ${msg}`)
      }

      const rawRate = Number(json?.rates?.CNY ?? json?.CNY ?? json?.rate ?? json?.rates?.cny)
      if (!rawRate || Number.isNaN(rawRate)) throw new Error('Invalid response format from rate API')

      setRate(rawRate)
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
        return
      }
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadRate(controller.signal)
    const id = setInterval(() => loadRate(), 5 * 60 * 1000)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [loadRate])

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className={className}>
      <Title order={4}>Currency Presets — USD ↔ CNY</Title>

      {loading && <Loader size="sm" />}
      {error && <Alert title="Error" color="red" mt="sm">{error}</Alert>}
      {!loading && !error && <div style={{ height: '16px' }}></div>}

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Title order={5}>USD → CNY</Title>
          <div style={{ marginTop: 12 }}>
            {USD_AMOUNTS.map((usd) => (
              <div key={usd} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                <Text><strong>${usd}</strong> → <strong>¥{rate ? fmt(usd * rate) : '—'}</strong></Text>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Title order={5}>CNY → USD</Title>
          <div style={{ marginTop: 12 }}>
            {CNY_AMOUNTS.map((cny) => (
              <div key={cny} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 8 }}>
                <Text>¥{cny} → <strong>{rate ? `$${fmt(cny / rate)}` : '—'}</strong></Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}