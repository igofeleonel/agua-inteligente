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
O usuário enviou um texto extraído via leitura de QR Code ou código de barras.

IMPORTANTE: Mesmo que o texto seja curto, incompleto ou não tenha informações claras, você DEVE retornar um JSON válido. 
Se não encontrar informações específicas, use valores padrão ou placeholders como "xxxxx" para indicar que não foi possível identificar.

Sua tarefa é analisar esse texto e devolver APENAS um JSON no formato abaixo (SEM comentários, SEM texto fora do JSON):

{
  "analysis": {
    "customer": "",
    "customer_full_name": "",
    "institution": "",
    "month": "",
    "summary": "",
    "consumption": {
      "total_m3": 0,
      "total_kwh": 0,
      "status": "LOW | MEDIUM | HIGH",
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

### Regras IMPORTANTES:

1. "customer"
   - Extraia o número da conta ou identificador do cliente.
   - Se não encontrar, use "xxxxx".

2. "customer_full_name"
   - Extraia o NOME COMPLETO do cliente/titular da conta.
   - Procure por nomes próprios no texto (ex: "João Silva", "Maria Santos").
   - Se não encontrar, use "xxxxx" para indicar que não foi identificado.

3. "institution"
   - Identifique a instituição/empresa fornecedora (ex: "Sanepar", "Copel", "Cemig", "Sabesp", "AES Eletropaulo").
   - Procure por nomes de empresas de água e energia no texto.
   - Se não encontrar mas o texto parecer ser de conta de água, use "Sanepar" ou "Fornecedor de Água".
   - Se não encontrar mas o texto parecer ser de conta de energia, use "Copel" ou "Fornecedor de Energia".
   - Se realmente não conseguir identificar, use "xxxxx".

4. "month"
   - Extraia o mês/ano de referência da conta (ex: "Janeiro 2024", "01/2024").
   - Se não encontrar, use "xxxxx".

5. "summary"
   - Crie um resumo claro e objetivo sobre a situação da conta.
   - Explique em 3–6 linhas.
   - Inclua informações sobre consumo, valor e situação geral.
   - Seja específico e útil para o usuário.
   - Se o texto do QR code não tiver informações suficientes, crie um resumo genérico mencionando que as informações não foram completamente identificadas.

6. "consumption"
   - "total_m3": Valor numérico do consumo de água em m³ (ou null se não houver).
   - "total_kwh": Valor numérico do consumo de energia em kWh (ou null se não houver).
   - "status": "LOW" se consumo está baixo, "MEDIUM" se moderado, "HIGH" se alto.
   - "comparison": Texto curto comparando com período anterior (ex: "15% acima da média").

7. "financial"
   - "total_value": Valor total da conta em número (ex: 150.50).
   - "due_date": Data de vencimento no formato "DD/MM/AAAA" ou texto legível.

8. "tips"
   - Gere uma lista de 5 a 10 dicas curtas para economizar.
   - Misture dicas de água e energia baseadas no tipo de conta.
   - Seja direto e prático.
   - Cada dica deve ter no máximo 80 caracteres.

9. "action_items"
   - Gere 3 a 5 ações de impacto real.
   - Formato exato:
     {
       "action": "Descrição objetiva da ação",
       "priority": "LOW | MEDIUM | HIGH",
       "potential_saving": "R$ X/mês"
     }
   - Prioridade baseada no impacto e facilidade de implementação.

10. IMPORTANTE:
   - NUNCA envie texto fora do JSON.
   - NUNCA invente valores absurdos. Seja coerente.
   - Se não encontrar uma informação, use null para números e string vazia para textos.
   - O JSON deve ser válido e parseável.

Texto da conta extraído do QR Code:
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
