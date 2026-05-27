export const ROUTES = ['Bogotá - Medellín', 'Bogotá - Cali', 'Bogotá - Barranquilla', 'Medellín - Cali', 'Cali - Bucaramanga']

function generateDemandData(route: string) {
  const base: Record<string, number> = {
    'Bogotá - Medellín': 420,
    'Bogotá - Cali': 310,
    'Bogotá - Barranquilla': 280,
    'Medellín - Cali': 190,
    'Cali - Bucaramanga': 145,
  }
  const b = base[route] ?? 200
  const result = []
  const today = new Date('2026-05-27')
  for (let i = -30; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const weekday = d.getDay()
    const weekend = weekday === 0 || weekday === 6 ? 1.3 : 1
    const noise = (Math.sin(i * 0.4 + b) * 0.15 + 1)
    const trend = i > 0 ? 1 + i * 0.005 : 1
    const value = Math.round(b * weekend * noise * trend)
    result.push({
      date: d.toISOString().split('T')[0],
      pasajeros: i < 0 ? value : undefined,
      prediccion: i >= 0 ? value : undefined,
    })
  }
  return result
}

export const demandDataByRoute: Record<string, ReturnType<typeof generateDemandData>> = {}
ROUTES.forEach(r => { demandDataByRoute[r] = generateDemandData(r) })

export const USERS = [
  { id: 'U001', name: 'Carlos Rodríguez', trips: 24 },
  { id: 'U002', name: 'María López', trips: 17 },
  { id: 'U003', name: 'Andrés Martínez', trips: 31 },
  { id: 'U004', name: 'Laura García', trips: 12 },
  { id: 'U005', name: 'Felipe Torres', trips: 8 },
]

export const DESTINATIONS = [
  { id: 'D01', name: 'Medellín', region: 'Antioquia', category: 'ciudad', tags: ['negocios', 'cultura', 'gastronomía'] },
  { id: 'D02', name: 'Cartagena', region: 'Bolívar', category: 'playa', tags: ['turismo', 'playa', 'historia'] },
  { id: 'D03', name: 'Santa Marta', region: 'Magdalena', category: 'playa', tags: ['playa', 'naturaleza', 'aventura'] },
  { id: 'D04', name: 'Cali', region: 'Valle del Cauca', category: 'ciudad', tags: ['cultura', 'música', 'gastronomía'] },
  { id: 'D05', name: 'San Andrés', region: 'Archipiélago', category: 'isla', tags: ['playa', 'buceo', 'relax'] },
  { id: 'D06', name: 'Villa de Leyva', region: 'Boyacá', category: 'colonial', tags: ['historia', 'cultura', 'naturaleza'] },
  { id: 'D07', name: 'Bucaramanga', region: 'Santander', category: 'ciudad', tags: ['aventura', 'naturaleza', 'negocios'] },
  { id: 'D08', name: 'Pereira', region: 'Risaralda', category: 'ciudad', tags: ['café', 'naturaleza', 'aventura'] },
]

const userPreferences: Record<string, string[]> = {
  U001: ['negocios', 'cultura', 'gastronomía'],
  U002: ['playa', 'relax', 'historia'],
  U003: ['aventura', 'naturaleza', 'café'],
  U004: ['cultura', 'historia', 'música'],
  U005: ['playa', 'buceo', 'turismo'],
}

export function getRecommendations(userId: string) {
  const prefs = userPreferences[userId] ?? ['cultura', 'naturaleza']
  return DESTINATIONS
    .map(d => ({
      ...d,
      score: d.tags.filter(t => prefs.includes(t)).length / d.tags.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}
