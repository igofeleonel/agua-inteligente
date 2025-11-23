/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  ScanLine,
  CheckCircle2,
<<<<<<< HEAD
  AlertTriangle,
  FileText,
=======
>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
<<<<<<< HEAD

export function BillAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
=======
import { Progress } from "@/components/ui/progress";

interface BillAnalyzerProps {
  onAnalysisComplete?: (data: any) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

export function BillAnalyzer({ onAnalysisComplete, onAnalyzingChange }: BillAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a

  const uploadAndAnalyze = async () => {
    if (!file) return;

<<<<<<< HEAD
=======
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setIsSuccess(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsSuccess(false);
    }
  };

  const analyzeBill = async () => {
    if (!selectedFile) return;

>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a
    setIsAnalyzing(true);
    if (onAnalyzingChange) onAnalyzingChange(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const form = new FormData();
    form.append("file", file);

    try {
<<<<<<< HEAD
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      setAnalysisText(json.analysis);
    } catch (err) {
      console.error(err);
=======
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        console.error("Erro na API:", data.error);
        // You might want to show a toast here
      } else {
        setIsSuccess(true);
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
      }
    } catch (error) {
      console.error("Erro na análise:", error);
    } finally {
      setIsAnalyzing(false);
      if (onAnalyzingChange) onAnalyzingChange(false);
>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a
    }

    setIsAnalyzing(false);
  };

  return (
    <Card className="border-border bg-card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-border border-b">
        <CardTitle className="text-foreground flex items-center gap-2 text-xl">
          <ScanLine className="text-primary h-6 w-6" />
          EcoWater AI
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Análise automática da conta — powered by Gemini
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
<<<<<<< HEAD
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
=======
        {!isSuccess ? (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 bg-secondary/20"} `}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando com Gemini...
                  </>
                ) : (
                  "Processar Conta na Nuvem"
                )}
              </Button>
            )}

            {isAnalyzing && (
              <div className="mt-6 w-full max-w-xs space-y-2">
                <Progress value={45} className="h-2" />
                <p className="text-muted-foreground animate-pulse text-xs">
                  Identificando padrões de consumo...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 mb-4 rounded-full p-4">
                <CheckCircle2 className="text-green-600 dark:text-green-400 h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                Análise Concluída!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                Os dados da sua conta foram processados com sucesso. Confira os insights ao lado.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedFile(null);
                  if (onAnalysisComplete) onAnalysisComplete(null);
                }}
>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a
              >
                Nova Análise
              </Button>
            </div>
<<<<<<< HEAD

            <div className="bg-secondary border-border rounded-lg border p-4">
              <h4 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                Diagnóstico da conta de luz
              </h4>

              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {analysisText}
              </p>
            </div>
=======
>>>>>>> 8fe610df12617442f7f92e96bc513e008a9b9b7a
          </div>
        )}
      </CardContent>
    </Card>
  );
}
