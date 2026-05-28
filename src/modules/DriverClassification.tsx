import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL: string | undefined = import.meta.env.VITE_DISTRACTION_API_URL

type DangerLevel = 'LOW' | 'MEDIUM' | 'HIGH'

interface PredictionResult {
  class: string
  danger_level: DangerLevel
  confidence: number
  probabilities: Record<string, number>
}

const CLASS_LABELS: Record<string, string> = {
  safe_driving: 'Conducción segura',
  using_phone: 'Uso del teléfono',
  turning: 'Girando',
  others: 'Otra distracción',
}

const DANGER_CONFIG: Record<DangerLevel, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: CheckCircle, label: 'Riesgo bajo' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: AlertTriangle, label: 'Riesgo medio' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: XCircle, label: 'Riesgo alto' },
}

export default function DriverClassification() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const predict = async () => {
    if (!file) return
    if (!API_URL) {
      console.error('VITE_DISTRACTION_API_URL no está definida')
      setError('API no configurada: falta la variable de entorno VITE_DISTRACTION_API_URL')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const data: PredictionResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const danger = result ? DANGER_CONFIG[result.danger_level] : null
  const DangerIcon = danger?.icon ?? CheckCircle

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Clasificación de Conducción Distractiva
          </CardTitle>
          <CardDescription>
            Sube una imagen del conductor para detectar comportamientos de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
                )}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Arrastra una imagen o haz clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground">JPG / PNG</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
              </div>

              <Button className="w-full" onClick={predict} disabled={!file || loading}>
                {loading ? 'Analizando...' : 'Analizar imagen'}
              </Button>

              {error && (
                <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            <div>
              {result ? (
                <div className="space-y-4">
                  <div className={cn('border rounded-xl p-4', danger?.bg)}>
                    <div className="flex items-center gap-3 mb-2">
                      <DangerIcon className={cn('h-6 w-6', danger?.color)} />
                      <div>
                        <p className={cn('font-bold text-lg', danger?.color)}>{danger?.label}</p>
                        <p className="text-sm text-muted-foreground">{CLASS_LABELS[result.class] ?? result.class}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confianza: <span className="font-semibold text-foreground">{(result.confidence * 100).toFixed(1)}%</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Probabilidades</p>
                    {Object.entries(result.probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, prob]) => (
                        <div key={cls} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{CLASS_LABELS[cls] ?? cls}</span>
                            <span className="font-medium">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Los resultados aparecerán aquí
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métricas del Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Accuracy', value: '94.2%' },
              { label: 'Precision', value: '93.8%' },
              { label: 'Recall', value: '92.5%' },
              { label: 'F1-Score', value: '93.1%' },
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
