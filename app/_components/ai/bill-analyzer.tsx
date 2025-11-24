/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { QrReader } from "react-qr-reader";
import {
  ScanLine,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Camera,
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

interface BillAnalyzerProps {
  onAnalysisComplete?: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

export function BillAnalyzer({
  onAnalysisComplete,
  onAnalyzingChange,
}: BillAnalyzerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [qrText, setQrText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const analyzeQRCode = async (content: string) => {
    setIsAnalyzing(true);
    onAnalyzingChange?.(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrcode: content }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Erro na API:", data.error);
      } else {
        setIsSuccess(true);

        if (data.analysis?.summary) {
          setAnalysisText(data.analysis.summary);
        }

        onAnalysisComplete?.(data);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsAnalyzing(false);
      onAnalyzingChange?.(false);
    }
  };

  return (
    <Card className="border-border bg-card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="border-border border-b bg-linear-to-r from-[#121D25] to-[#122529] dark:from-[#121D25] dark:to-[#122529]">
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
            {!qrText ? (
              <div className="flex flex-col items-center text-center">
                {!isScanning ? (
                  <>
                    <Camera className="text-primary mb-4 h-12 w-12" />
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      Ler QR Code da Conta
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-xs text-sm">
                      Aponte a câmera para o QR Code da conta de água ou luz.
                    </p>

                    <Button
                      onClick={() => setIsScanning(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    >
                      Iniciar Scanner
                    </Button>
                  </>
                ) : (
                  <div className="w-full">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      onResult={(result) => {
                        if (result) {
                          const text = result.getText();
                          setQrText(text);
                          setIsScanning(false);
                          analyzeQRCode(text);
                        }
                      }}
                      containerStyle={{ width: "100%" }}
                      videoStyle={{ width: "100%" }}
                    />

                    <Button
                      variant="outline"
                      onClick={() => setIsScanning(false)}
                      className="mt-4"
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
                  setQrText(null);
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
