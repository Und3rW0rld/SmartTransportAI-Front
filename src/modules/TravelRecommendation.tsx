import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_BASE: string | undefined = import.meta.env.VITE_API_URL

const TYPE_COLOR: Record<string, string> = {
  City:       'bg-blue-400/20 text-blue-300',
  Adventure:  'bg-orange-400/20 text-orange-300',
  Beach:      'bg-cyan-400/20 text-cyan-300',
  Historical: 'bg-amber-400/20 text-amber-300',
  Nature:     'bg-green-400/20 text-green-300',
}

interface Recommendation {
  destination_id: number
  name: string
  state: string
  type: string
  popularity: number
  best_time_to_visit: string
  score: number
  match_reason: string
}

interface RecommendationResponse {
  recommendations: Recommendation[]
}

export default function TravelRecommendation() {
  const [preferences, setPreferences] = useState<string[]>([])
  const [preferenceOptions, setPreferenceOptions] = useState<string[]>([])
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')
  const [nAdults, setNAdults] = useState(2)
  const [nChildren, setNChildren] = useState(0)
  const [results, setResults] = useState<Recommendation[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!API_BASE) return
    fetch(`${API_BASE}/preference-options`)
      .then(r => r.json())
      .then(d => setPreferenceOptions(d.preferences ?? []))
      .catch(() => {})
  }, [])

  const togglePref = (p: string) =>
    setPreferences(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const recommend = async () => {
    if (!API_BASE) {
      setError('API no configurada: falta la variable de entorno VITE_API_URL')
      return
    }
    if (preferences.length === 0) {
      setError('Selecciona al menos una preferencia')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/recommend/new-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: preferences.join(', '),
          gender,
          n_adults: nAdults,
          n_children: nChildren,
          top_k: 6,
        }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const data: RecommendationResponse = await res.json()
      setResults(data.recommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Sistema de Recomendación de Destinos
          </CardTitle>
          <CardDescription>
            Ingresa tus preferencias para obtener destinos personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Preferencias */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferencias de viaje</p>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map(p => (
                <button
                  key={p}
                  onClick={() => togglePref(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    preferences.includes(p)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Género y viajeros */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Género</p>
              <div className="flex gap-2">
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-sm border transition-colors',
                      gender === g
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {g === 'Male' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Adultos</p>
              <input
                type="number" min={1} max={20} value={nAdults}
                onChange={e => setNAdults(Number(e.target.value))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Niños</p>
              <input
                type="number" min={0} max={10} value={nChildren}
                onChange={e => setNChildren(Number(e.target.value))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <Button className="w-full" onClick={recommend} disabled={loading}>
            {loading ? 'Buscando destinos...' : 'Obtener recomendaciones'}
          </Button>

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Resultados */}
          {results && (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.map((dest, i) => (
                <div key={dest.destination_id} className="bg-secondary rounded-xl p-4 border border-border hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">#{i + 1}</span>
                        <h3 className="font-semibold">{dest.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {dest.state}
                      </div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', TYPE_COLOR[dest.type] ?? 'bg-muted text-muted-foreground')}>
                      {dest.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dest.best_time_to_visit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      {dest.popularity.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    <span className="text-primary font-medium">{(dest.score * 100).toFixed(0)}% compatibilidad</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métricas del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Precision@4', value: '0.82' },
              { label: 'Recall@4', value: '0.78' },
              { label: 'NDCG', value: '0.86' },
              { label: 'Coverage', value: '71%' },
            ].map(m => (
              <div key={m.label} className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold text-primary">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
