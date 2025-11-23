"use client";

import { useState } from "react";
import { Droplet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LeakCalculator() {
  const [leakType, setLeakType] = useState("drip");

  const leaks = {
    drip: {
      label: "Gotejamento Lento",
      desc: "Uma gota a cada 5 segundos",
      litersDay: 20,
      color: "text-cyan-400",
    },
    fast: {
      label: "Gotejamento Rápido",
      desc: "Uma gota por segundo",
      litersDay: 100,
      color: "text-teal-400",
    },
    stream: {
      label: "Fio de Água",
      desc: "Abertura de 2mm",
      litersDay: 400,
      color: "text-blue-400",
    },
  };

  const selected = leaks[leakType as keyof typeof leaks];

  return (
    <Card className="border-slate-800 bg-[#121D25]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Droplet className="h-5 w-5 text-red-500" />
          Calculadora de Vazamento
        </CardTitle>
        <CardDescription className="text-slate-400">
          O impacto de uma torneira pingando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select value={leakType} onValueChange={setLeakType}>
          <SelectTrigger className="border-slate-700 bg-[#0E131B] text-slate-100">
            <SelectValue placeholder="Tipo de Vazamento" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-[#121D25] text-slate-100">
            <SelectItem value="drip">Gotejamento Lento</SelectItem>
            <SelectItem value="fast">Gotejamento Rápido</SelectItem>
            <SelectItem value="stream">Fio de Água (2mm)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center justify-center py-4">
          <div className={`text-center ${selected.color}`}>
            <div className="mb-2 text-5xl font-bold">{selected.litersDay}L</div>
            <div className="text-sm font-medium text-slate-300">
              desperdiçados por dia
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-slate-800 bg-[#0E131B] p-4 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Em um mês:</span>
            <span className="font-bold text-cyan-400">
              {selected.litersDay * 30} Litros
            </span>
          </div>
          <div className="flex justify-between">
            <span>Em um ano:</span>
            <span className="font-bold text-cyan-400">
              {((selected.litersDay * 365) / 1000).toFixed(1)} m³
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-800 pt-2">
            <span>Custo Anual (aprox):</span>
            <span className="text-lg font-bold text-teal-400">
              R$ {(((selected.litersDay * 365) / 1000) * 8.5).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
