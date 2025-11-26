/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// Inicializa Gemini API (gratuito - gemini-1.5-flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.3, // Menor temperatura para respostas mais precisas
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

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

IMPORTANTE: 
- Você DEVE extrair informações REAIS do texto. NUNCA use "xxxxx" a menos que seja IMPOSSÍVEL identificar.
- Analise TODO o texto cuidadosamente para encontrar nomes, datas, valores, instituições.
- QR codes e códigos de barras de contas (Sanepar, Copel) contêm informações estruturadas - extraia TODAS.
- Se encontrar QUALQUER informação, use ela. Só use valores padrão se realmente não houver dados.

Sua tarefa é analisar esse texto e devolver APENAS um JSON no formato abaixo (SEM comentários, SEM texto fora do JSON):

{
  "analysis": {
    "customer": "",
    "customer_full_name": "",
    "institution": "",
    "month": "",
    "date": "",
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
   - Procure por nomes próprios no texto (ex: "João Silva", "Maria Santos", "JOSE DA SILVA", "IGOR", "MARIA").
   - Nomes podem estar em MAIÚSCULAS, minúsculas ou mistos.
   - Procure por padrões como: palavras que começam com letra maiúscula seguidas de outras palavras.
   - Se encontrar apenas primeiro nome (ex: "Igor", "Maria"), use ele mesmo - NÃO use "xxxxx".
   - Se encontrar múltiplos nomes, use o mais completo ou o que parecer ser o titular.
   - Se realmente não encontrar NENHUM nome, use "xxxxx".

3. "institution"
   - Identifique a instituição/empresa fornecedora (ex: "Sanepar", "Copel", "Cemig", "Sabesp", "AES Eletropaulo").
   - Procure por nomes de empresas de água e energia no texto.
   - Se não encontrar mas o texto parecer ser de conta de água, use "Sanepar" ou "Fornecedor de Água".
   - Se não encontrar mas o texto parecer ser de conta de energia, use "Copel" ou "Fornecedor de Energia".
   - Se realmente não conseguir identificar, use "xxxxx".

4. "month"
   - Extraia o mês/ano de referência da conta (ex: "Janeiro 2024", "01/2024", "01/2024", "JAN/2024").
   - Procure por padrões de data: MM/AAAA, Mês/Ano, etc.
   - Se não encontrar, use "xxxxx".

5. "date"
   - Extraia a DATA COMPLETA (dia/mês/ano) quando disponível.
   - Procure por padrões: DD/MM/AAAA, DD-MM-AAAA, DD.MM.AAAA.
   - Pode ser data de vencimento, emissão ou referência.
   - Formato de saída: "DD/MM/AAAA" (ex: "15/03/2024").
   - Se encontrar múltiplas datas, use a mais recente ou a que parecer ser a data principal.
   - Se não encontrar, use "xxxxx".

6. "summary"
   - Crie um resumo claro e objetivo sobre a situação da conta.
   - Explique em 3–6 linhas.
   - Inclua informações sobre consumo, valor e situação geral.
   - Seja específico e útil para o usuário.
   - Se o texto do QR code não tiver informações suficientes, crie um resumo genérico mencionando que as informações não foram completamente identificadas.

7. "consumption"
   - "total_m3": Valor numérico do consumo de água em m³ (ou null se não houver).
   - "total_kwh": Valor numérico do consumo de energia em kWh (ou null se não houver).
   - "status": "LOW" se consumo está baixo, "MEDIUM" se moderado, "HIGH" se alto.
   - "comparison": Texto curto comparando com período anterior (ex: "15% acima da média").

8. "financial"
   - "total_value": Valor total da conta em número (ex: 150.50).
   - Procure por valores monetários: R$, reais, valores com vírgula ou ponto decimal.
   - "due_date": Data de vencimento/validação no formato "DD/MM/AAAA" (ex: "15/03/2024").
   - Procure por padrões: "Vencimento", "Venc", "Vencimento em", "Pagar até", "Validade", "Data de validade", seguidos de data.
   - Esta é a DATA DE VALIDAÇÃO da conta - extraia com prioridade.
   - Se não encontrar, use "xxxxx".

9. "tips"
   - Gere uma lista de 8 a 12 dicas ESPECÍFICAS para economizar água/energia.
   - Baseie-se nas recomendações oficiais da Sanepar e Copel.
   - Foque em economia de até 50%: vazamentos, desperdício, soluções baratas.
   - Inclua dicas sobre: verificar vazamentos, arejadores, descargas econômicas, reuso de água, banhos rápidos.
   - Seja direto e prático.
   - Cada dica deve ter no máximo 80 caracteres.
   - Exemplos: "Verifique vazamentos em torneiras e canos", "Use arejador para reduzir vazão em 50%", "Reaproveite água da máquina de lavar".

10. "action_items"
   - Gere 4 a 6 ações ESPECÍFICAS para economizar até 50% na conta.
   - Baseie-se em soluções da Sanepar/Copel: verificação de vazamentos, instalação de redutores, reuso de água.
   - Formato exato:
     {
       "action": "Descrição objetiva da ação (ex: 'Instalar arejador em todas as torneiras')",
       "priority": "LOW | MEDIUM | HIGH",
       "potential_saving": "R$ X/mês ou X% de economia"
     }
   - Prioridade baseada no impacto e facilidade de implementação.
   - Foque em ações que realmente economizam água e reduzem a conta.

11. IMPORTANTE:
   - NUNCA envie texto fora do JSON.
   - NUNCA invente valores absurdos. Seja coerente.
   - PRIORIDADE: Extraia informações REAIS. Só use "xxxxx" se for IMPOSSÍVEL identificar.
   - Se encontrar QUALQUER nome (mesmo que só primeiro nome como "Igor" ou "Maria"), use ele - NÃO use "xxxxx".
   - Analise TODO o texto do QR code/código de barras cuidadosamente.
   - QR codes de contas (Sanepar, Copel) contêm dados estruturados - extraia TUDO que encontrar.
   - O JSON deve ser válido e parseável.

12. DICAS ESPECÍFICAS SANEPAR/COPEL (para economia de até 50%):
   - Baseie-se nas recomendações oficiais das empresas.
   - Foque em: verificação de vazamentos, arejadores de torneira, descargas econômicas, banhos rápidos.
   - Inclua soluções baratas: garrafa na caixa d'água, reuso de água da máquina, coleta de chuva.
   - Evite desperdício: não deixar torneira aberta, consertar vazamentos imediatamente.
   - Meta: reduzir consumo em até 50% com ações práticas e baratas.

Texto da conta extraído do QR Code/Código de Barras:
"${text}"

ANÁLISE DETALHADA - EXTRAIA TUDO EM TEMPO REAL:
- Procure por TODOS os padrões de nome, data, valor, instituição no texto acima.
- Extraia informações mesmo que estejam em formatos diferentes ou codificados.
- Se encontrar "Igor", "Maria", "João" ou QUALQUER nome, use ele - NUNCA use "xxxxx" se houver nome.
- Se encontrar "Sanepar", "Copel" ou QUALQUER instituição, use ela - NUNCA use "xxxxx" se houver instituição.
- Se o texto contiver apenas números/códigos, tente identificar padrões de conta, data, valor.
- Seja AGRESSIVO na extração - melhor pegar informação parcial do que usar "xxxxx".
- PRIORIDADE MÁXIMA: Extrair nome completo, instituição, número da conta, período e data de validação.
- Se encontrar qualquer informação parcial, use ela - não espere informação completa.
- O objetivo é mostrar dados REAIS em TEMPO REAL, não placeholders.
    `;
    // ---------------------------------------------------------

    console.log("=== GEMINI API - INICIANDO ANÁLISE ===");
    console.log(
      "Texto recebido (primeiros 200 chars):",
      text.substring(0, 200),
    );

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("=== GEMINI API - RESPOSTA RECEBIDA ===");
      console.log("Resposta completa:", responseText.substring(0, 500));

      // Limpa a resposta do Gemini (remove markdown code blocks se houver)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanedResponse);
        console.log("=== GEMINI API - JSON PARSEADO COM SUCESSO ===");
        console.log("Dados extraídos:", JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.error("=== ERRO AO PARSEAR JSON ===");
        console.error("Resposta original:", responseText);
        console.error("Resposta limpa:", cleanedResponse);
        console.error("Erro:", parseError);

        return NextResponse.json(
          {
            error: "A IA retornou uma resposta inválida.",
            raw: responseText,
            cleaned: cleanedResponse,
          },
          { status: 500 },
        );
      }

      // Valida se a estrutura está correta
      if (!parsed.analysis) {
        console.error("=== ESTRUTURA INVÁLIDA - SEM 'analysis' ===");
        return NextResponse.json(
          {
            error: "Estrutura de resposta inválida.",
            raw: parsed,
          },
          { status: 500 },
        );
      }

      console.log("=== GEMINI API - RETORNANDO DADOS ===");
      return NextResponse.json(parsed);
    } catch (geminiError: any) {
      console.error("=== ERRO NA CHAMADA DO GEMINI ===");
      console.error("Erro:", geminiError);
      return NextResponse.json(
        {
          error: `Erro ao chamar Gemini API: ${geminiError?.message || "Erro desconhecido"}`,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Erro interno" },
      { status: 500 },
    );
  }
}
