/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BillAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      setAnalysisText(json.analysis);
    } catch (err) {
      console.error(err);
    }

    setIsAnalyzing(false);
  };

  return (
    <Card className="border-border bg-card h-full overflow-hidden">
      <CardHeader className="bg-secondary border-border border-b">
        <CardTitle className="text-foreground flex items-center gap-2">
          <ScanLine className="text-primary h-5 w-5" />
          EcoWater AI
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Análise automática da conta — powered by Gemini
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {!analysisText ? (
          // UPLOAD
          <div className="border-border bg-secondary/20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center">
            <div className="bg-secondary border-border mb-4 rounded-full border p-4">
              <Upload className="text-primary h-8 w-8" />
            </div>

            <input
              type="file"
              className="hidden"
              id="upload"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <label
              htmlFor="upload"
              className="text-primary cursor-pointer text-sm underline"
            >
              Escolher arquivo
            </label>

            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 w-full"
              disabled={!file || isAnalyzing}
              onClick={uploadAndAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando com Gemini...
                </>
              ) : (
                "Enviar e Analisar"
              )}
            </Button>
          </div>
        ) : (
          // RESULTADO DA ANÁLISE
          <div className="space-y-6">
            <div className="bg-secondary/50 border-primary/20 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary h-6 w-6" />
                <div>
                  <p className="text-foreground font-semibold">
                    Análise Completa
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Relatório gerado automaticamente pela IA
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnalysisText(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Nova Análise
              </Button>
            </div>

            <div className="bg-secondary border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                Diagnóstico da conta de luz
              </h4>

              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {analysisText}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
