import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import DemandPrediction from '@/modules/DemandPrediction'
import DriverClassification from '@/modules/DriverClassification'
import TravelRecommendation from '@/modules/TravelRecommendation'
import { TrendingUp, Camera, MapPin, Bus } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">SmartTransport AI</h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">Sistema Inteligente de Transporte</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="demand">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="demand" className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Predicción de Demanda</span>
              <span className="sm:hidden">Demanda</span>
            </TabsTrigger>
            <TabsTrigger value="driver" className="flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Conducción Distractiva</span>
              <span className="sm:hidden">Conducción</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendaciones</span>
              <span className="sm:hidden">Viajes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demand">
            <DemandPrediction />
          </TabsContent>
          <TabsContent value="driver">
            <DriverClassification />
          </TabsContent>
          <TabsContent value="recommendations">
            <TravelRecommendation />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-12 py-4">
        <p className="text-center text-xs text-muted-foreground">
          SmartTransport AI · Universidad Nacional de Colombia · 2026
        </p>
      </footer>
    </div>
  )
}
