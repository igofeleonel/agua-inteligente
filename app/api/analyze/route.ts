/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// ---- TARIFAS SANEPAR ----
function calcularTarifaSanepar(consumoM3: number) {
  if (consumoM3 <= 5) return 61.08;
  if (consumoM3 <= 10) return 84.33;
  if (consumoM3 <= 15) return 132.83;
  if (consumoM3 <= 20) return 184.63;
  if (consumoM3 <= 30) return 289.85;
  return 289.85 + (consumoM3 - 30) * 14.49;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let qrText = null;
    let file: File | null = null;

    // ---- JSON (QR CODE) ----
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // 🔧 CORREÇÃO — AGORA LÊ CORRETAMENTE O QR CODE DO FRONTEND
      qrText = body.qrText || null;

      if (!qrText) {
        return NextResponse.json(
          { error: "QR Code inválido ou vazio." },
          { status: 400 },
        );
      }
    }

    // ---- FORM DATA (UPLOAD IMAGEM) ----
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Nenhum arquivo enviado." },
          { status: 400 },
        );
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // -----------------------------------------------------
    // 1) PROCESSAR QR CODE
    // -----------------------------------------------------
    if (qrText) {
      const prompt = `
Você agora é um **técnico especialista da Sanepar**, responsável por orientar clientes sobre:
- Redução de consumo de água,
- Identificação de desperdícios,
- Aproveitamento correto das tarifas da Sanepar,
- Como alcançar redução mínima de **40% do valor da conta**.

Use este texto do QR Code como dados oficiais:
${qrText}

Use também as tarifas reais da Sanepar:
- Até 5 m³ → R$ 52,33/m³
- 6 a 10 m³ → R$ 1,62/m³
- 11 a 15 m³ → R$ 9,02/m³
- 16 a 20 m³ → R$ 9,06/m³
- 21 a 30 m³ → R$ 9,14/m³
- Acima de 30 m³ → R$ 15,46/m³

Agora gere APENAS JSON PURO neste formato:

{
  "summary": "",
  "consumption": {
    "current_m3": 0,
    "recommended_m3": 0,
    "saving_m3": 0
  },
  "financial": {
    "current_cost": 0,
    "recommended_cost": 0,
    "monthly_saving": 0,
    "saving_percentage": 0
  },
  "recommended_actions": [
    {
      "title": "",
      "description": "",
      "why_it_matters": "",
      "estimated_saving_m3": 0,
      "estimated_saving_cost": 0
    }
  ],
  "tips": []
}

As recomendações devem seguir os padrões técnicos da Sanepar:
- Teste de vazamento no vaso sanitário,
- Vazamentos silenciosos,
- Verificação do hidrômetro,
- Tempo de banho,
- Fechamento de torneiras,
- Reaproveitamento de água,
- Manutenção de válvulas e registros,
- Ajuste de boias e caixas de descarga.

A economia estimada deve buscar pelo menos **40%** do valor atual da conta.
`;

      const result = await model.generateContent(prompt);
      const clean = result.response.text().replace(/```json|```/g, "");
      const data = JSON.parse(clean);

      return NextResponse.json(data);
    }

    // -----------------------------------------------------
    // 2) PROCESSAR IMAGEM (UPLOAD)
    // -----------------------------------------------------
    const buffer = Buffer.from(await file!.arrayBuffer());

    const prompt = `
Analise esta imagem de conta de água de acordo com os padrões técnicos da Sanepar.

RETORNE APENAS JSON PURO:

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
  "recommended_actions": [
    {
      "title": "",
      "description": "",
      "why_it_matters": "",
      "estimated_saving_m3": 0,
      "estimated_saving_cost": 0
    }
  ],
  "tips": [],
  "estimated_saving": ""
}
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: file!.type || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const clean = result.response.text().replace(/```json|```/g, "");
    const data = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json(
      { error: "Erro interno ao analisar a conta." },
      { status: 500 },
    );
  }
}
