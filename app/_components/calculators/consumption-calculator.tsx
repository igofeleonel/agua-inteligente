"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function ConsumptionCalculator() {
  const [people, setPeople] = useState(3);
  const [avgTime, setAvgTime] = useState(10); // minutes per shower
  const [showersPerDay, setShowersPerDay] = useState(1);

  // Calculations
  // Shower flow ~ 12L/min (standard) or 6L/min (economical)
  // Cost approx R$ 5.00 per m3 (water + sewage) - varies greatly but good for simulation
  const RATE_PER_M3 = 8.5; // Combined water/sewage

  const dailyLitersStandard = people * showersPerDay * avgTime * 12;
  const dailyLitersEco = people * showersPerDay * avgTime * 6;

  const monthlyCostStandard = ((dailyLitersStandard * 30) / 1000) * RATE_PER_M3;
  const monthlyCostEco = ((dailyLitersEco * 30) / 1000) * RATE_PER_M3;

  const savings = monthlyCostStandard - monthlyCostEco;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-cyan-600" />
          Simulador de Gastos
        </CardTitle>
        <CardDescription>
          Calcule quanto o banho custa na sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Pessoas na casa</Label>
              <span className="text-sm text-slate-500">{people} pessoas</span>
            </div>
            <Slider
              value={[people]}
              onValueChange={(val) => setPeople(val[0])}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Tempo de Banho (minutos)</Label>
              <span className="text-sm text-slate-500">{avgTime} min</span>
            </div>
            <Slider
              value={[avgTime]}
              onValueChange={(val) => setAvgTime(val[0])}
              min={1}
              max={30}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Banhos por pessoa/dia</Label>
              <span className="text-sm text-slate-500">
                {showersPerDay} banhos
              </span>
            </div>
            <Slider
              value={[showersPerDay]}
              onValueChange={(val) => setShowersPerDay(val[0])}
              min={1}
              max={4}
              step={1}
              className="py-2"
            />
          </div>
        </div>

        <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
          <div className="bg-card border-border rounded-lg border p-4 text-center">
            <p className="text-xs font-bold text-teal-500 uppercase">
              Custo Estimado (Mensal)
            </p>
            <p className="text-2xl font-bold text-teal-400">
              R$ {monthlyCostStandard.toFixed(2)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {Math.round((dailyLitersStandard * 30) / 1000)} m³ / mês
            </p>
          </div>

          <div className="rounded-lg border border-teal-900/50 bg-teal-950/30 p-4 text-center">
            <p className="text-xs font-bold text-teal-500 uppercase">
              Com Chuveiro Econômico
            </p>
            <p className="text-2xl font-bold text-teal-400">
              R$ {monthlyCostEco.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-teal-500">
              Economia de R$ {savings.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
