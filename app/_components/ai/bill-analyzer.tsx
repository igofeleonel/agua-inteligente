/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import {
  Upload,
  Loader2,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BillAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Calling our internal API route
      const response = await fetch("/api/analyze", {
        method: "POST",
      });

      const data = await response.json();

      setAnalyzedData(data);
    } catch (error) {
      console.error("Erro na análise:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-border bg-card h-full overflow-hidden">
      <CardHeader className="bg-secondary border-border border-b">
        <CardTitle className="text-foreground flex items-center gap-2">
          <ScanLine className="text-primary h-5 w-5" />
          EcoWater AI
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Transforme sua conta em economia real com Gemini
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!analyzedData ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragActive ? "border-primary bg-secondary/50" : "border-border hover:border-primary/50 bg-secondary/20"} `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => {
              handleDrag(e);
              simulateAnalysis();
            }}
          >
            <div className="bg-secondary border-border mb-4 rounded-full border p-4">
              <Upload className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-1 text-lg font-semibold">
              Upload da Conta
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs text-sm">
              Arraste sua conta de água ou luz aqui, ou clique para selecionar.
              Suporta PDF, JPG, PNG.
            </p>
            <Button
              onClick={simulateAnalysis}
              disabled={isAnalyzing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando com Gemini (Server)...
                </>
              ) : (
                "Processar Conta na Nuvem"
              )}
            </Button>
            {isAnalyzing && (
              <p className="text-muted-foreground mt-4 animate-pulse text-xs">
                Identificando padrões de consumo...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-secondary/50 border-primary/20 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary h-6 w-6" />
                <div>
                  <p className="text-foreground font-semibold">
                    Análise Completa
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Processado via Gemini API
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnalyzedData(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Nova Análise
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary border-border rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Valor Total</div>
                <div className="text-primary text-xl font-bold">
                  R$ {analyzedData.analysis.financial.total_value.toFixed(2)}
                </div>
              </div>
              <div className="bg-secondary border-border rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">Consumo</div>
                <div className="text-foreground text-xl font-bold">
                  {analyzedData.analysis.consumption.total_m3} m³
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-foreground flex items-center text-sm font-semibold">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                Pontos de Atenção
              </h4>
              {analyzedData.analysis.insights.map(
                (insight: string, i: number) => (
                  <div
                    key={i}
                    className="text-muted-foreground before:text-primary relative pl-6 text-sm before:absolute before:left-2 before:content-['•']"
                  >
                    {insight}
                  </div>
                ),
              )}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground flex w-full items-center gap-2 bg-transparent"
                >
                  <FileJson className="h-4 w-4" />
                  Ver Resposta JSON (Insomnia)
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-h-[80vh] max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Resposta Bruta da API (JSON)
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="border-border text-primary h-[400px] w-full rounded-md border bg-[#0E131B] p-4 font-mono text-xs">
                  <pre>{JSON.stringify(analyzedData, null, 2)}</pre>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
