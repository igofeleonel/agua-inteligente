/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// ---- TARIFAS SANEPAR (2024 - atualizadas) ----
// Tabela real simplificada (Residencial Social/Comum)
// Fonte: https://www.sanepar.com.br/tarifas
function calcularTarifaSanepar(consumoM3: number) {
  if (consumoM3 <= 5) return 61.08;
  if (consumoM3 <= 10) return 84.33;
  if (consumoM3 <= 15) return 132.83;
  if (consumoM3 <= 20) return 184.63;
  if (consumoM3 <= 30) return 289.85;
  return 289.85 + (consumoM3 - 30) * 14.49; // Faixa extra
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const bytes = Buffer.from(await file.arrayBuffer());

    const prompt = `
Analise esta conta de água/luz da imagem enviada.

RETORNE APENAS JSON PURO com o formato:

{
  "summary": "",
  "financial": {
    "total_value": 0,
    "due_date": "",
    "is_value_high": false,
    "monthly_variation": ""
  },
  "consumption": {
    "total_m3": 0,
    "status": "",
    "is_above_expected": false,
    "comparison": ""
  },
  "appliances": [],
  "waste_points": [],
  "tips": [],
  "estimated_saving": ""
}

Regras para as dicas:
- 4 a 6 dicas de economia da SANEPAR (ÁGUA)
- 1 a 2 dicas da COPEL (ENERGIA)
- Linguagem simples e prática
- Não use markdown
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: bytes.toString("base64"),
                mimeType: file.type || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    let text = result.response.text().trim();

    // Remove markdown
    text = text.replace(/```json/gi, "");
    text = text.replace(/```/g, "");
    text = text.replace(/`/g, "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON INVÁLIDO:", text);
      return NextResponse.json(
        { error: "A IA retornou JSON inválido", raw: text },
        { status: 500 },
      );
    }

    // ---- Cálculo de tarifa SANEPAR baseado no consumo ----
    const consumo = Number(data.consumption.total_m3 || 0);
    const tarifaCalculada = calcularTarifaSanepar(consumo);

    // ---- GERAR AÇÕES RECOMENDADAS ----
    const acoesRecomendadas = [
      `Sua tarifa estimada conforme a SANEPAR é: R$ ${tarifaCalculada.toFixed(
        2,
      )}`,
      `Veja todas as tarifas da SANEPAR: https://www.sanepar.com.br/tarifas`,
      "Reveja pontos de desperdício identificados na conta.",
      "Acompanhe semanalmente o hidrômetro para evitar surpresas.",
      "Considere instalar arejadores ou redutores de vazão.",
    ];

    // ------ Retorno final (sem JSON bruto) ------
    return NextResponse.json({
      summary: data.summary,
      financial: data.financial,
      consumption: data.consumption,
      tips: data.tips,
      waste_points: data.waste_points,
      estimated_saving: data.estimated_saving,
      acoes_recomendadas: acoesRecomendadas,
      tarifa_sanepar: tarifaCalculada,
    });
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json(
      { error: "Erro interno ao analisar a conta." },
      { status: 500 },
    );
  }
}
