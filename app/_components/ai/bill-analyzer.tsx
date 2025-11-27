/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import type React from "react";
import { useState } from "react";
import { Upload, Loader2, ScanLine, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Droplet,
  Zap,
  TrendingDown,
  Calendar,
  DollarSign,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BillAnalyzerProps {
  onAnalysisComplete?: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

export function BillAnalyzer({
  onAnalysisComplete,
  onAnalyzingChange,
}: BillAnalyzerProps) {
  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Evita erro de hidratação do Next.js
  useEffect(() => setReady(true), []);

  // Adiciona estilos CSS para animação da linha de varredura
  useEffect(() => {
    if (scanning) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes scanLine {
          0% {
            top: calc(50% - 128px);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            top: calc(50% + 128px);
            opacity: 1;
          }
        }
        .scan-line {
          animation: scanLine 2s linear infinite;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [scanning]);

  async function safelyStop() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (_) {}
  }

  const startScanner = async () => {
    setCameraError(null);
    setScanning(true);

    await safelyStop();

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    // html5-qrcode já suporta QR codes e códigos de barras automaticamente
    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Suporta automaticamente: QR_CODE, CODE_128, CODE_39, EAN_13, EAN_8, UPC_A, UPC_E, etc.
        },
        async (decoded: string) => {
          await safelyStop();
          setScanning(false);
          setDecodedText(decoded);
          console.log("QR Code/Código de Barras escaneado:", decoded);
          console.log("Tamanho do texto:", decoded.length);
          analyzeQRCode(decoded);
        },
        () => {},
      )
      .catch((err: any) => {
        console.error("Erro ao iniciar scanner:", err);

        if (err?.name === "NotAllowedError") {
          setCameraError(
            "Permissão negada. Libere a câmera no navegador (Configurações → Privacidade → Câmera).",
          );
        } else if (err?.name === "NotFoundError") {
          setCameraError("Nenhuma câmera foi encontrada neste dispositivo.");
        } else {
          setCameraError("Erro ao iniciar câmera: " + (err.message || err));
        }

        setScanning(false);
      });
  };

  const analyzeQRCode = async (content: string) => {
    setIsAnalyzing(true);
    onAnalyzingChange?.(true);

    // Limpa e prepara o texto para análise
    const cleanedText = content.trim();
    console.log(
      "Enviando para API:",
      cleanedText.substring(0, 200) + (cleanedText.length > 200 ? "..." : ""),
    );

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText }),
      });

      const data = await response.json();
      console.log("=== DADOS RECEBIDOS DA API (TEMPO REAL) ===");
      console.log("Raw data:", data);
      console.log("Analysis:", data.analysis);
      console.log("Nome:", data.analysis?.customer_full_name);
      console.log("Instituição:", data.analysis?.institution);
      console.log("Nº Conta:", data.analysis?.customer);
      console.log("Período:", data.analysis?.month);
      console.log("Data Validação:", data.analysis?.financial?.due_date);
      console.log("===========================================");

      // Sempre processa os dados, mesmo se houver erro parcial
      if (data.error) {
        console.error("Erro na API:", data.error);
        // Cria estrutura padrão mesmo com erro
        const defaultData = {
          analysis: {
            customer: "xxxxx",
            customer_full_name: "xxxxx",
            institution: "xxxxx",
            month: "xxxxx",
            date: "xxxxx",
            summary:
              "Não foi possível analisar completamente o QR code. Por favor, tente novamente ou verifique se o código está legível.",
            consumption: {
              total_m3: null,
              total_kwh: null,
              status: "MEDIUM",
              comparison: "",
            },
            financial: {
              total_value: 0,
              due_date: "xxxxx",
            },
            tips: [],
            action_items: [],
          },
        };
        setIsSuccess(true);
        setAnalysisText(defaultData.analysis.summary);
        setAnalysisData(defaultData);
        onAnalysisComplete?.(defaultData);
      } else {
        // Processa dados reais em TEMPO REAL - remove "xxxxx" quando houver dados
        const processField = (value: any, defaultValue: string = "xxxxx") => {
          if (
            !value ||
            value === "xxxxx" ||
            (typeof value === "string" && value.trim() === "")
          ) {
            return defaultValue;
          }
          return value;
        };

        const processedData = {
          analysis: {
            customer: processField(data.analysis?.customer),
            customer_full_name: processField(data.analysis?.customer_full_name),
            institution: processField(data.analysis?.institution),
            month: processField(data.analysis?.month),
            date: processField(data.analysis?.date),
            summary: data.analysis?.summary || "Análise realizada com sucesso.",
            consumption: data.analysis?.consumption || {
              total_m3: null,
              total_kwh: null,
              status: "MEDIUM",
              comparison: "",
            },
            financial: {
              total_value: data.analysis?.financial?.total_value || 0,
              due_date: processField(data.analysis?.financial?.due_date), // Data de validação
            },
            tips: data.analysis?.tips || [],
            action_items: data.analysis?.action_items || [],
          },
        };

        // Log para debug em tempo real
        console.log("=== DADOS EXTRAÍDOS EM TEMPO REAL ===");
        console.log(
          "Nome completo:",
          processedData.analysis.customer_full_name,
        );
        console.log("Instituição:", processedData.analysis.institution);
        console.log("Nº da Conta:", processedData.analysis.customer);
        console.log("Período:", processedData.analysis.month);
        console.log(
          "Data de Validação:",
          processedData.analysis.financial.due_date,
        );
        console.log("Data:", processedData.analysis.date);
        console.log("====================================");

        // Atualiza estado imediatamente para exibir em tempo real
        setIsSuccess(true);
        setAnalysisText(processedData.analysis.summary);
        setAnalysisData(processedData);
        onAnalysisComplete?.(processedData);
      }
    } catch (e) {
      console.error("Erro ao analisar QR Code:", e);
      // Cria dados padrão em caso de erro
      const errorData = {
        analysis: {
          customer: "xxxxx",
          customer_full_name: "xxxxx",
          institution: "xxxxx",
          month: "xxxxx",
          date: "xxxxx",
          summary: "Erro ao processar o QR code. Por favor, tente novamente.",
          consumption: {
            total_m3: null,
            total_kwh: null,
            status: "MEDIUM",
            comparison: "",
          },
          financial: {
            total_value: 0,
            due_date: "xxxxx",
          },
          tips: [],
          action_items: [],
        },
      };
      setIsSuccess(true);
      setAnalysisText(errorData.analysis.summary);
      setAnalysisData(errorData);
      onAnalysisComplete?.(errorData);
    }

    setIsAnalyzing(false);
    onAnalyzingChange?.(false);
  };

  if (!ready) return null;

  return (
    <Card className="border-border bg-card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
      {/* 🔥 TÍTULO COM COR #121D25 */}
      <CardHeader className="border-border border-b bg-[#121D25] dark:bg-[#121D25]">
      <CardHeader className="border-border border-b bg-linear-to-r from-[#121D25] to-[#122529]">
        <CardTitle className="text-foreground flex items-center gap-2 text-xl">
          <ScanLine className="text-primary h-6 w-6" />
          EcoWater AI
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Análise automática da conta — QR Code + Gemini
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {!isSuccess ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              dragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 bg-secondary/20"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />

            <div className="bg-secondary border-border mb-4 rounded-full border p-4 shadow-sm">
              <Upload className="text-primary h-8 w-8" />
            </div>

            <h3 className="text-foreground mb-1 text-lg font-semibold">
              {selectedFile ? selectedFile.name : "Upload da Conta"}
            </h3>

            <p className="text-muted-foreground mb-6 max-w-xs text-sm">
              {selectedFile
                ? "Arquivo selecionado. Clique abaixo para processar."
                : "Arraste sua conta de água ou luz aqui, ou clique para selecionar."}
            </p>

            {!selectedFile ? (
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full max-w-xs"
              >
                Selecionar Arquivo
              </Button>
            ) : (
              <Button
                onClick={analyzeBill}
                disabled={isAnalyzing}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 w-full max-w-xs shadow-md transition-all hover:scale-105"
              >
                {isAnalyzing ? (
          <>
            {!decodedText ? (
              <div className="flex flex-col items-center text-center">
                {!scanning ? (
                  <>
                    <Camera className="text-primary mb-4 h-12 w-12" />
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      Ler QR Code da Conta
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-xs text-sm">
                      Aponte a câmera para o QR Code ou código de barras da
                      conta de água (Sanepar/Copel).
                    </p>

                    {cameraError && (
                      <p className="mb-2 text-sm text-red-500">{cameraError}</p>
                    )}

                    <Button
                      onClick={startScanner}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    >
                      Iniciar Scanner
                    </Button>
                  </>
                ) : (
                  <div className="relative h-[400px] w-full overflow-hidden">
                    <div
                      id="qr-reader"
                      className="absolute top-0 left-0 h-full w-full bg-black/20"
                    />

                    {/* Overlay do foco com linha de varredura animada */}
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                      {/* Moldura do scanner */}
                      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-red-500 shadow-lg shadow-red-500/50" />

                      {/* Cantos decorativos */}
                      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
                        {/* Canto superior esquerdo */}
                        <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-4 border-l-4 border-red-400" />
                        {/* Canto superior direito */}
                        <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-4 border-r-4 border-red-400" />
                        {/* Canto inferior esquerdo */}
                        <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-red-400" />
                        {/* Canto inferior direito */}
                        <div className="absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-4 border-b-4 border-red-400" />
                      </div>

                      {/* Linha de varredura animada - se move de cima para baixo */}
                      <div
                        className="scan-line absolute left-1/2 h-1 w-64 -translate-x-1/2 shadow-lg shadow-red-500/80"
                        style={{
                          background:
                            "linear-gradient(to right, transparent, #ef4444, transparent)",
                          top: "calc(50% - 128px)",
                        }}
                      />

                      {/* Efeito de brilho na linha */}
                      <div
                        className="scan-line absolute left-1/2 h-0.5 w-64 -translate-x-1/2 bg-red-400 opacity-75 blur-sm"
                        style={{
                          top: "calc(50% - 128px)",
                        }}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        safelyStop();
                        setScanning(false);
                      }}
                      className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            ) : null}

            {isAnalyzing && (
              <div className="mx-auto mt-6 w-full max-w-xs space-y-2">
                <Progress value={60} className="h-2" />
                <p className="text-muted-foreground animate-pulse text-center text-xs">
                  Analisando com Gemini...
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
            <div className="flex flex-col items-center justify-center rounded-lg border border-green-200 bg-green-50/50 p-8 text-center dark:border-green-900 dark:bg-green-900/10">
              <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Análise Concluída!
              </h3>

              <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                Os dados da sua conta foram processados com sucesso. Confira os
                insights ao lado.
                A análise com QR Code foi realizada com sucesso!
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setDecodedText(null);
                  setAnalysisText(null);
                  setAnalysisData(null);
                  onAnalysisComplete?.(null);
                }}
              >
                Nova Análise
              </Button>
            </div>

            {analysisData && (
              <div className="space-y-4">
                {/* Informações do Cliente e Instituição - SEMPRE mostra */}
                <div className="bg-secondary/50 border-border rounded-lg border p-4">
                  <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    Informações da Conta
                  </h4>
                  <div className="space-y-2">
                    {/* Nome Completo - SEMPRE mostra */}
                    <div className="flex items-center gap-2">
                      <User className="text-primary h-3 w-3" />
                      <span className="text-muted-foreground text-xs font-medium">
                        Nome Completo:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {analysisData.analysis?.customer_full_name &&
                        analysisData.analysis.customer_full_name !== "xxxxx"
                          ? analysisData.analysis.customer_full_name
                          : analysisData.analysis?.customer &&
                              analysisData.analysis.customer !== "xxxxx"
                            ? analysisData.analysis.customer
                            : "Aguardando leitura..."}
                      </span>
                    </div>

                    {/* Instituição - SEMPRE mostra */}
                    <div className="flex items-center gap-2">
                      <Building2 className="text-primary h-3 w-3" />
                      <span className="text-muted-foreground text-xs font-medium">
                        Instituição:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {analysisData.analysis?.institution &&
                        analysisData.analysis.institution !== "xxxxx"
                          ? analysisData.analysis.institution
                          : "Aguardando leitura..."}
                      </span>
                    </div>

                    {/* Nº da Conta - SEMPRE mostra */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium">
                        Nº da Conta:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {analysisData.analysis?.customer &&
                        analysisData.analysis.customer !== "xxxxx"
                          ? analysisData.analysis.customer
                          : "Aguardando leitura..."}
                      </span>
                    </div>

                    {/* Período - SEMPRE mostra */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium">
                        Período:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {analysisData.analysis?.month &&
                        analysisData.analysis.month !== "xxxxx"
                          ? analysisData.analysis.month
                          : "Aguardando leitura..."}
                      </span>
                    </div>

                    {/* Data de Validação - SEMPRE mostra */}
                    <div className="flex items-center gap-2">
                      <Calendar className="text-primary h-3 w-3" />
                      <span className="text-muted-foreground text-xs font-medium">
                        Data de Validação:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {analysisData.analysis?.financial?.due_date &&
                        analysisData.analysis.financial.due_date !== "xxxxx"
                          ? analysisData.analysis.financial.due_date
                          : analysisData.analysis?.date &&
                              analysisData.analysis.date !== "xxxxx"
                            ? analysisData.analysis.date
                            : "Aguardando leitura..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumo da Análise */}
                {analysisText && (
                  <div className="bg-secondary border-border rounded-lg border p-4">
                    <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                      <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                      Resumo da Análise
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {analysisText}
                    </p>
                  </div>
                )}

                {/* Informações Principais */}
                <div className="grid grid-cols-2 gap-3">
                  {analysisData.analysis?.financial?.total_value && (
                    <div className="bg-secondary/30 border-border rounded-lg border p-3">
                      <div className="text-muted-foreground mb-1 flex items-center text-xs uppercase">
                        <DollarSign className="mr-1 h-3 w-3" />
                        Valor Total
                      </div>
                      <div className="text-primary text-lg font-bold">
                        R${" "}
                        {Number(
                          analysisData.analysis.financial.total_value,
                        ).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {(analysisData.analysis?.consumption?.total_m3 ||
                    analysisData.analysis?.consumption?.total_kwh) && (
                    <div className="bg-secondary/30 border-border rounded-lg border p-3">
                      <div className="text-muted-foreground mb-1 flex items-center text-xs uppercase">
                        <Droplet className="mr-1 h-3 w-3" />
                        Consumo
                      </div>
                      <div className="text-foreground text-lg font-bold">
                        {analysisData.analysis.consumption.total_m3 ||
                          analysisData.analysis.consumption.total_kwh ||
                          "0"}
                        <span className="text-muted-foreground ml-1 text-xs">
                          {analysisData.analysis.consumption.total_m3
                            ? "m³"
                            : "kWh"}
                        </span>
                      </div>
                    </div>
                  )}

                  {analysisData.analysis?.financial?.due_date && (
                    <div className="bg-secondary/30 border-border rounded-lg border p-3">
                      <div className="text-muted-foreground mb-1 flex items-center text-xs uppercase">
                        <Calendar className="mr-1 h-3 w-3" />
                        Vencimento
                      </div>
                      <div className="text-foreground text-sm font-medium">
                        {analysisData.analysis.financial.due_date}
                      </div>
                    </div>
                  )}

                  {analysisData.analysis?.consumption?.status && (
                    <div className="bg-secondary/30 border-border rounded-lg border p-3">
                      <div className="text-muted-foreground mb-1 flex items-center text-xs uppercase">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Status
                      </div>
                      <Badge
                        variant={
                          analysisData.analysis.consumption.status === "HIGH"
                            ? "destructive"
                            : analysisData.analysis.consumption.status ===
                                "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                        className="h-5 text-[10px]"
                      >
                        {analysisData.analysis.consumption.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Dicas Principais */}
                {analysisData.analysis?.tips &&
                  analysisData.analysis.tips.length > 0 && (
                    <div className="bg-secondary/20 border-border rounded-lg border p-4">
                      <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                        <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                        Dicas de Economia
                      </h4>
                      <div className="space-y-2">
                        {analysisData.analysis.tips
                          .slice(0, 5)
                          .map((tip: string, i: number) => (
                            <div
                              key={i}
                              className="text-muted-foreground flex items-start gap-2 text-xs"
                            >
                              <span className="text-primary mt-0.5">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Ações Recomendadas */}
                {analysisData.analysis?.action_items &&
                  analysisData.analysis.action_items.length > 0 && (
                    <div className="bg-secondary/20 border-border rounded-lg border p-4">
                      <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                        <TrendingDown className="mr-2 h-4 w-4 text-green-500" />
                        Ações Recomendadas
                      </h4>
                      <div className="space-y-2">
                        {analysisData.analysis.action_items
                          .slice(0, 3)
                          .map((item: any, i: number) => (
                            <div
                              key={i}
                              className="bg-card border-border rounded-md border p-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-foreground text-xs font-medium">
                                    {item.action}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`h-4 text-[9px] ${
                                        item.priority === "HIGH"
                                          ? "border-red-500 text-red-500"
                                          : item.priority === "MEDIUM"
                                            ? "border-yellow-500 text-yellow-500"
                                            : "border-blue-500 text-blue-500"
                                      }`}
                                    >
                                      {item.priority}
                                    </Badge>
                                    {item.potential_saving && (
                                      <span className="text-primary text-[10px] font-medium">
                                        {item.potential_saving}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
