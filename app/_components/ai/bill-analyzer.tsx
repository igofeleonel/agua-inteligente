/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { Upload, Loader2, ScanLine, CheckCircle2 } from "lucide-react";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

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

    setIsAnalyzing(true);
    if (onAnalyzingChange) onAnalyzingChange(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        console.error("Erro na API:", data.error);
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
    }
  };

  return (
    <Card className="border-border bg-card h-full overflow-hidden shadow-lg transition-all hover:shadow-xl">
      {/* 🔥 TÍTULO COM COR #121D25 */}
      <CardHeader className="border-border border-b bg-[#121D25] dark:bg-[#121D25]">
        <CardTitle className="text-foreground flex items-center gap-2 text-xl">
          <ScanLine className="text-primary h-6 w-6" />
          EcoWater AI
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Transforme sua conta em economia real com Gemini
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
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedFile(null);
                  if (onAnalysisComplete) onAnalysisComplete(null);
                }}
              >
                Nova Análise
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
