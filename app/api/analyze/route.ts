import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// INIT GEMINI
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

Com base no QR Code da fatura:
"${qrText}"

Gere os seguintes resultados:

### 1. RESUMO TÉCNICO
- Diagnóstico da conta
- Anomalias no consumo
- Possíveis erros de leitura ou medição

### 2. CONSUMO ESTIMADO (m³)
- Faixa tarifária
- Comparação com média do Paraná

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
Baseado em orientações reais aplicadas **em todo o Paraná**:
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

Retorne tudo em formato de texto contínuo e organizado.
`;

    // Gemini → geração
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      summary: text, // Texto geral
      insights: text, // Você pode separar depois se quiser
      actions: text, // Por enquanto retornamos tudo junto
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
