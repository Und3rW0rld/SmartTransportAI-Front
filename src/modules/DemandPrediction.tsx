import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROUTES, demandDataByRoute, MODEL_METRICS } from '@/data/mockData'
import { TrendingUp } from 'lucide-react'
export default function DemandPrediction() {
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0])
  const data = demandDataByRoute[selectedRoute]

  const realData = data.filter(d => d.pasajeros !== undefined)
  const lastReal = realData[realData.length - 1]
  const firstPred = data.find(d => d.prediccion !== undefined)
  const maxPred = Math.max(...data.filter(d => d.prediccion !== undefined).map(d => d.prediccion!))
  const avgPred = Math.round(
    data.filter(d => d.prediccion !== undefined).reduce((s, d) => s + d.prediccion!, 0) /
    data.filter(d => d.prediccion !== undefined).length,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Predicción de Demanda — Próximos 30 días
          </CardTitle>
          <CardDescription>
            Modelo LSTM entrenado con datos históricos de pasajeros por ruta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {ROUTES.map(r => (
              <Button
                key={r}
                variant={selectedRoute === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRoute(r)}
              >
                {r}
              </Button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 25%)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }}
                tickFormatter={v => v.slice(5)}
                interval={6}
              />
              <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(222 47% 15%)', border: '1px solid hsl(217 33% 25%)', borderRadius: 8 }}
                labelStyle={{ color: 'hsl(210 40% 98%)' }}
              />
              <Legend />
              <ReferenceLine x="2026-05-27" stroke="hsl(199 89% 48%)" strokeDasharray="4 4" label={{ value: 'Hoy', fill: 'hsl(199 89% 48%)', fontSize: 11 }} />
              <Line type="monotone" dataKey="pasajeros" name="Pasajeros reales" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="prediccion" name="Predicción" stroke="#34d399" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Último real</p>
              <p className="text-2xl font-bold text-blue-400">{lastReal?.pasajeros ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{lastReal?.date}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Promedio predicho</p>
              <p className="text-2xl font-bold text-emerald-400">{avgPred}</p>
              <p className="text-xs text-muted-foreground">pasajeros/día</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pico predicho</p>
              <p className="text-2xl font-bold text-emerald-400">{maxPred}</p>
              <p className="text-xs text-muted-foreground">{firstPred?.date}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métricas del Modelo — {selectedRoute}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {[
              { label: 'RMSE', value: MODEL_METRICS[selectedRoute]?.RMSE.toFixed(2), desc: 'pasajeros' },
              { label: 'MAE',  value: MODEL_METRICS[selectedRoute]?.MAE.toFixed(2),  desc: 'pasajeros' },
              { label: 'MAPE', value: MODEL_METRICS[selectedRoute]?.MAPE.toFixed(1) + '%', desc: 'error medio' },
            ].map(m => (
              <div key={m.label} className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold text-primary">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            * MAPE elevado en Homa Bay se debe a días con demanda cero (Semana Santa). Se recomienda usar RMSE y MAE como métricas principales.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
