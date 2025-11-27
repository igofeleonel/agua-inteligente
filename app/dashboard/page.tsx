/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BathTimer } from "../_components/tools/bath-timer";
import { BillAnalyzer } from "../_components/ai/bill-analyzer";
import { ConsumptionCalculator } from "../_components/calculators/consumption-calculator";
import { LeakCalculator } from "../_components/calculators/leak-calculator";
import {
  Droplet,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  FileJson,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-foreground text-3xl font-bold tracking-tight">
            Painel de Controle
          </h2>
          <p className="text-muted-foreground">
            Bem-vindo ao Água Inteligente. Vamos economizar hoje?
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="default"
            className="bg-secondary text-primary hover:bg-secondary/80 border-border border px-3 py-1 text-sm font-medium"
          >
            <Droplet className="mr-2 h-4 w-4" />
            Economia Estimada: R${" "}
            {analyzedData
              ? analyzedData.analysis.financial?.total_value
                ? (analyzedData.analysis.financial.total_value * 0.2).toFixed(2)
                : "45,00"
              : "45,00"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-card border-border text-muted-foreground grid h-auto w-full grid-cols-2 border p-1 md:grid-cols-4">
          <TabsTrigger
            value="ai"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-3"
          >
            I.A Analysis
          </TabsTrigger>
          <TabsTrigger
            value="timer"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-3"
          >
            Banho Inteligente
          </TabsTrigger>
          <TabsTrigger
            value="calc"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-3"
          >
            Calculadoras
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="data-[state=active]:bg-secondary data-[state=active]:text-primary py-3"
          >
            Guia & Dicas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-5 lg:col-span-4">
              <BillAnalyzer
                onAnalysisComplete={setAnalyzedData}
                onAnalyzingChange={setIsAnalyzing}
              />
            </div>
            <div className="grid gap-4 md:col-span-7 lg:col-span-8">
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="text-primary mr-2 h-5 w-5" />
                      Insights do Gemini
                    </div>
                    {analyzedData && !isAnalyzing && (
                      <Badge
                        variant="outline"
                        className="border-[#51A2FF] bg-[#14273B] text-[#51A2FF] dark:border-[#51A2FF] dark:bg-[#14273B] dark:text-[#51A2FF]"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3 text-[#51A2FF]" />
                        Análise Ativa
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isAnalyzing
                      ? "Processando sua conta..."
                      : analyzedData
                        ? `Análise de ${analyzedData.analysis.customer} - ${analyzedData.analysis.month}`
                        : "Análise automática da sua conta"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="animate-pulse space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                      </div>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-40" />
                          <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-40" />
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !analyzedData ? (
                    <div className="space-y-4">
                      <div className="bg-secondary/50 border-border rounded-lg border p-4">
                        <h4 className="text-primary mb-2 font-medium">
                          Resumo da Análise
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Faça o upload da sua conta ao lado para que a I.A
                          possa identificar padrões de consumo e sugerir
                          melhorias. O sistema irá ler o QR Code ou os dados da
                          imagem.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/30 border-border rounded-lg border p-4">
                          <div className="text-muted-foreground text-xs tracking-wider uppercase">
                            Consumo Atual
                          </div>
                          <div className="text-foreground mt-1 text-2xl font-bold">
                            -- m³
                          </div>
                        </div>
                        <div className="bg-secondary/30 border-border rounded-lg border p-4">
                          <div className="text-muted-foreground text-xs tracking-wider uppercase">
                            Meta Ideal
                          </div>
                          <div className="text-primary mt-1 text-2xl font-bold">
                            -- m³
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in space-y-6 duration-500">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="bg-secondary/30 border-border hover:bg-secondary/50 rounded-xl border p-4 transition-colors">
                          <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                            Valor Total
                          </div>
                          <div className="text-primary text-2xl font-bold">
                            R${" "}
                            {analyzedData.analysis.financial?.total_value?.toFixed(
                              2,
                            ) ?? "0.00"}
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            Vencimento:{" "}
                            {analyzedData.analysis.financial?.due_date ??
                              "Não identificado"}
                          </div>
                        </div>
                        <div className="bg-secondary/30 border-border hover:bg-secondary/50 rounded-xl border p-4 transition-colors">
                          <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                            Consumo
                          </div>
                          <div className="flex items-baseline gap-1">
                            <div className="text-foreground text-2xl font-bold">
                              {analyzedData.analysis.consumption?.total_m3 ??
                                analyzedData.analysis.consumption?.total_kwh ??
                                "0"}
                            </div>
                            <span className="text-muted-foreground text-sm font-medium">
                              {analyzedData.analysis.consumption?.total_m3
                                ? "m³"
                                : "kWh"}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs">
                            <Badge
                              variant={
                                analyzedData.analysis.consumption?.status ===
                                "HIGH"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="h-5 px-1.5 text-[10px]"
                            >
                              {analyzedData.analysis.consumption?.status ??
                                "N/A"}
                            </Badge>
                            <span className="text-muted-foreground max-w-20 truncate">
                              {analyzedData.analysis.consumption?.comparison ??
                                ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                          <h4 className="text-foreground flex items-center text-sm font-semibold">
                            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                            Insights da IA
                          </h4>
                          <div className="bg-secondary/20 space-y-2 rounded-lg p-3">
                            {analyzedData.analysis.insights?.map(
                              (insight: string, i: number) => (
                                <div
                                  key={i}
                                  className="text-muted-foreground flex items-start gap-2 text-sm"
                                >
                                  <ArrowRight className="text-primary mt-1 h-3 w-3 shrink-0" />
                                  <span>{insight}</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-foreground flex items-center text-sm font-semibold">
                            <TrendingDown className="mr-2 h-4 w-4 text-green-500" />
                            Ações Recomendadas
                          </h4>
                          <div className="grid gap-2">
                            {analyzedData.analysis.action_items
                              ?.slice(0, 3)
                              .map((item: any, i: number) => (
                                <div
                                  key={i}
                                  className="group bg-card border-border hover:border-primary/30 relative overflow-hidden rounded-lg border p-2.5 transition-all hover:shadow-sm"
                                >
                                  <div
                                    className={`absolute top-0 bottom-0 left-0 w-1 ${item.priority === "HIGH" ? "bg-red-500" : item.priority === "MEDIUM" ? "bg-yellow-500" : "bg-blue-500"}`}
                                  />
                                  <div className="flex items-start justify-between gap-2 pl-2">
                                    <div>
                                      <p className="text-foreground group-hover:text-primary line-clamp-1 text-xs font-medium transition-colors">
                                        {item.action}
                                      </p>
                                      <p className="text-muted-foreground mt-0.5 text-[10px]">
                                        Prioridade {item.priority}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="h-5 border-[#51A2FF] bg-[#14273B] px-1 text-[10px] whitespace-nowrap text-[#51A2FF] dark:border-[#51A2FF] dark:bg-[#14273B] dark:text-[#51A2FF]"
                                    >
                                      {item.potential_saving}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border text-muted-foreground hover:text-foreground flex h-8 items-center gap-2 bg-transparent text-xs"
                            >
                              <FileJson className="h-3 w-3" />
                              Ver JSON Completo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border max-h-[80vh] max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">
                                Resposta da Gemini API
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="border-border text-primary h-[400px] w-full rounded-md border bg-[#0E131B] p-4 font-mono text-xs">
                              <pre>{JSON.stringify(analyzedData, null, 2)}</pre>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timer" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <BathTimer />
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Estatísticas do Banho</CardTitle>
                <CardDescription>Seu histórico recente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-border flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Média da Semana</p>
                      <p className="text-muted-foreground text-sm">
                        Tempo médio
                      </p>
                    </div>
                    <span className="text-foreground text-2xl font-bold">
                      8:45
                    </span>
                  </div>
                  <div className="border-border flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Economia Estimada</p>
                      <p className="text-muted-foreground text-sm">Em litros</p>
                    </div>
                    <span className="text-primary text-2xl font-bold">
                      120 L
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calc" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ConsumptionCalculator />
            <LeakCalculator />
          </div>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Soluções Baratas</CardTitle>
              <CardDescription>
                Guia interativo para economizar sem gastar muito
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Redutor de Vazão",
                  cost: "R$ 15,00",
                  save: "20%",
                  icon: "💧",
                },
                {
                  title: "Arejador de Torneira",
                  cost: "R$ 10,00",
                  save: "15%",
                  icon: "🚿",
                },
                {
                  title: "Garrafa na Caixa",
                  cost: "R$ 0,00",
                  save: "1.5L/descarga",
                  icon: "🚽",
                },
                {
                  title: "Reuso da Máquina",
                  cost: "R$ 20,00",
                  save: "40L/lavagem",
                  icon: "🧺",
                },
                {
                  title: "Verificação de Vazamento",
                  cost: "R$ 0,00",
                  save: "Variável",
                  icon: "🔍",
                },
                {
                  title: "Coleta de Chuva",
                  cost: "R$ 50,00",
                  save: "Jardim",
                  icon: "🌧️",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="border-border bg-secondary/20 hover:border-primary hover:bg-secondary/40 flex cursor-pointer flex-col rounded-lg border p-4 transition-colors"
                >
                  <div className="mb-3 text-3xl">{item.icon}</div>
                  <h3 className="text-foreground font-semibold">
                    {item.title}
                  </h3>
                  <div className="mt-auto flex justify-between pt-4 text-sm">
                    <span className="text-muted-foreground">
                      Custo:{" "}
                      <span className="text-foreground font-medium">
                        {item.cost}
                      </span>
                    </span>
                    <span className="text-primary font-medium">
                      {item.save}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
