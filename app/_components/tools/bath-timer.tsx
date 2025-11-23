"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BathTimer() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Vazão média: 9 litros/min → 0.15 L/s
  const LITERS_PER_SECOND = 0.15;
  const GOAL_SECONDS = 300; // 5 min

  // -------- USEEFFECT CORRIGIDO (SEM ERROS) -------- //
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    // Sempre retorna uma função válida
    return () => {
      clearInterval(interval);
    };
  }, [isActive]);
  // ------------------------------------------------- //

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
  };

  const progress = Math.min((time / GOAL_SECONDS) * 100, 100);
  const liters = (time * LITERS_PER_SECOND).toFixed(1);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Timer Banho Inteligente</span>

          <span
            className={time > GOAL_SECONDS ? "text-red-500" : "text-green-500"}
          >
            {time > GOAL_SECONDS ? "Meta Excedida" : "Dentro da Meta"}
          </span>
        </CardTitle>

        <CardDescription>Meta: 5 minutos (45 Litros)</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-6 py-8">
        <div className="font-mono text-6xl font-bold tracking-tighter text-white">
          {formatTime(time)}
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full space-y-2">
          <Progress
            value={progress}
            className="h-3 bg-slate-800"
            indicatorClassName={
              time > GOAL_SECONDS ? "bg-red-500" : "bg-[#0080FF]"
            }
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>0:00</span>
            <span>05:00</span>
          </div>
        </div>

        {/* LITERS */}
        <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-6 py-3 font-medium text-blue-400">
          <Droplet className="fill-current" size={18} />
          {liters} Litros (estimado)
        </div>

        {/* BUTTONS */}
        <div className="flex w-full items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-slate-700 bg-transparent text-slate-300 hover:bg-transparent hover:text-slate-300"
            onClick={resetTimer}
          >
            <RotateCcw />
          </Button>

          <Button
            className={`h-12 flex-1 rounded-full text-lg font-medium text-white ${
              isActive
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-[#0080FF] hover:bg-blue-600"
            }`}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? (
              <>
                <Pause className="mr-2 fill-current" /> Pausar
              </>
            ) : (
              <>
                <Play className="mr-2 fill-current" /> Iniciar Banho
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
