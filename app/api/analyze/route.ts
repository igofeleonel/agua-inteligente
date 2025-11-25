/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Nenhum texto enviado." },
        { status: 400 },
      );
    }

    // ------------------- PROMPT PRINCIPAL -------------------
    const prompt = `
Você é uma IA especialista em análise de contas de água e energia. 
O usuário enviou um texto extraído via leitura de QR Code.

Sua tarefa é analisar esse texto e devolver APENAS um JSON no formato abaixo (SEM comentários, SEM texto fora do JSON):

{
  "analysis": {
    "customer": "",
    "month": "",
    "summary": "",
    "consumption": {
      "total_m3": 0,
      "total_kwh": 0,
      "status": "",
      "comparison": ""
    },
    "financial": {
      "total_value": 0,
      "due_date": ""
    },
    "tips": [],
    "action_items": []
  }
}

### Regras:

1. "summary"
   - Crie um resumo claro e objetivo sobre a situação da conta.
   - Explique em 3–6 linhas.

2. "tips"
   - Gere uma lista de 5 a 10 dicas curtas para economizar.
   - Misture dicas de água e energia.
   - Seja direto e prático.

3. "action_items"
   - Gere 3 a 5 ações de impacto real.
   - Formato:
     {
       "action": "Descrição objetiva",
       "priority": "LOW | MEDIUM | HIGH",
       "potential_saving": "R$ X/mês"
     }

4. Consumptions:
   - Detecte m³ ou kWh automaticamente com base no texto.
   - Se não encontrar valores, coloque null.

5. NUNCA envie texto fora do JSON.
6. NUNCA invente valores absurdos. Seja coerente.

Texto da conta:
"${text}"
    `;
    // ---------------------------------------------------------

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error: "A IA retornou uma resposta inválida.",
          raw: responseText,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 },
    );
  }
}
