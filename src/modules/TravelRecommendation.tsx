import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { USERS, getRecommendations, DESTINATIONS } from '@/data/mockData'
import { MapPin, Star, Users } from 'lucide-react'

const CATEGORY_COLOR: Record<string, string> = {
  ciudad: 'bg-blue-400/20 text-blue-300',
  playa: 'bg-cyan-400/20 text-cyan-300',
  isla: 'bg-teal-400/20 text-teal-300',
  colonial: 'bg-amber-400/20 text-amber-300',
}

export default function TravelRecommendation() {
  const [selectedUser, setSelectedUser] = useState(USERS[0].id)
  const [showAll, setShowAll] = useState(false)

  const user = USERS.find(u => u.id === selectedUser)!
  const recs = getRecommendations(selectedUser)
  const displayed = showAll ? DESTINATIONS : recs

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Sistema de Recomendación de Destinos
          </CardTitle>
          <CardDescription>
            Filtrado colaborativo basado en historial de viajes y preferencias del usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {USERS.map(u => (
              <button
                key={u.id}
                onClick={() => { setSelectedUser(u.id); setShowAll(false) }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                  selectedUser === u.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {u.name}
                <span className="ml-1 text-xs opacity-70">({u.trips} viajes)</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {showAll ? 'todos los destinos' : `top 4 recomendaciones para ${user.name}`}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Ver recomendados' : 'Ver todos'}
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {displayed.map((dest, i) => {
              const scored = 'score' in dest ? dest as typeof dest & { score: number } : null
              return (
                <div key={dest.id} className="bg-secondary rounded-xl p-4 border border-border hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {!showAll && i < 4 && (
                          <span className="text-xs font-bold text-primary">#{i + 1}</span>
                        )}
                        <h3 className="font-semibold">{dest.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {dest.region}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLOR[dest.category] ?? 'bg-muted text-muted-foreground'}`}>
                      {dest.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {dest.tags.map(t => (
                      <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                    ))}
                  </div>

                  {scored && !showAll && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-medium">{(scored.score * 100).toFixed(0)}% compatibilidad</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
