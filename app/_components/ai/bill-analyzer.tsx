/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import { ScanLine, CheckCircle2, AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Evita erro de hidratação do Next.js
  useEffect(() => setReady(true), []);

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

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded: string) => {
          await safelyStop();
          setScanning(false);
          setDecodedText(decoded);
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

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrText: content }),
      });

      const data = await response.json();

      if (!data.error) {
        setIsSuccess(true);
        setAnalysisText(data.summary); // resumo geral
        onAnalysisComplete?.(data); // envia {summary, insights, actions}
      }
    } catch (e) {
      console.error("Erro ao analisar QR Code:", e);
    }

    setIsAnalyzing(false);
    onAnalyzingChange?.(false);
  };

  /** 🚀 Scanner transparente estilo demo oficial */
  useEffect(() => {
    if (!isScanning) return;

    const qrRegionId = "qr-reader";
    html5QrcodeRef.current = new Html5Qrcode(qrRegionId);

    html5QrcodeRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250, // 🔥 REMOVIDO verbose (não existe nesta versão)
        },
        (decodedText) => {
          html5QrcodeRef.current
            ?.stop()
            .then(() => {
              setQrText(decodedText);
              setIsScanning(false);
              analyzeQRCode(decodedText);
            })
            .catch(() => {});
        },
        () => {}, // ignora erros
      )
      .catch((err) => {
        console.error("Erro ao iniciar scanner:", err);
        setIsScanning(false);
      });

    return () => {
      html5QrcodeRef.current?.stop().catch(() => {});
    };
  }, [isScanning]);

  return (
    <Card className="border-border bg-card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
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
                      Aponte a câmera para o QR Code da conta de água.
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
                  <div className="relative h-[400px] w-full">
                    <div
                      id="qr-reader"
                      className="absolute top-0 left-0 h-full w-full bg-black/20"
                    />

                    {/* Overlay de foco estilo demo */}
                    <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-red-500" />
                      <div className="absolute top-1/2 left-1/2 h-0.5 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse bg-red-500" />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        safelyStop();
                        setScanning(false);
                      }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2"
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
                A análise com QR Code foi realizada com sucesso!
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setDecodedText(null);
                  setAnalysisText(null);
                  onAnalysisComplete?.(null);
                }}
              >
                Nova Análise
              </Button>
            </div>

            {analysisText && (
              <div className="bg-secondary border-border rounded-lg border p-4">
                <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                  <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                  Diagnóstico da conta
                </h4>

                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {analysisText}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
