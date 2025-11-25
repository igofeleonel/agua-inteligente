import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Inicializa Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function POST(req: Request) {
  try {
    const { qrText } = await req.json();

    if (!qrText) {
      return NextResponse.json({ error: "QR Code vazio." }, { status: 400 });
    }

    // -----------------------------
    // PROMPT OTIMIZADO (PARANÁ INTEIRO)
    // -----------------------------
    const prompt = `
Você agora é um especialista técnico da SANEPAR com mais de 15 anos de experiência analisando consumo em todo o estado do Paraná.

Use as informações extraídas do QR Code abaixo para gerar uma análise técnica:
QR CODE LIDO:
${qrText}

Gere os seguintes resultados:

### 1. RESUMO TÉCNICO
- Diagnóstico da conta
- Anomalias no consumo
- Possíveis erros de leitura ou medição

### 2. CONSUMO ESTIMADO (m³)
- Faixa tarifária
- Comparação com a média do Paraná

### 3. PONTOS DE ATENÇÃO
- Vazamentos
- Caixa acoplada
- Torneiras
- Bomba hidráulica
- Chuveiro/resistência
- Entrada de ar no hidrômetro

### 4. POSSÍVEIS PROBLEMAS FUTUROS
- Custos adicionais
- Danos no imóvel
- Equipamentos queimando
- Vazamentos ocultos se agravando

### 5. INSIGHTS (COMO REDUZIR ATÉ 50% DA CONTA)
Baseado em orientações reais aplicadas em todo o Paraná:
- Curitiba e região metropolitana
- Norte, Oeste, Litoral e interior do PR
- Técnicas oficiais de economia da SANEPAR
- Hábitos com impacto imediato (20% a 50%)

### 6. AÇÕES RECOMENDADAS
Crie um plano dividido em:
- Ações imediatas (0–24h)
- Curto prazo (7 dias)
- Longo prazo (30 dias)
- Economia estimada em R$

Retorne tudo em formato de texto contínuo, organizado e profissional.
`;

    // Geração pelo Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      summary: text,
      insights: text,
      actions: text,
    });
  } catch (error) {
    console.error("Erro ao gerar análise no Gemini:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
