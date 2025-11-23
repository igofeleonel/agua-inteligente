/* eslint-disable prefer-const */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

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

    // Conectar ao Gemini 2.0 (versão grátis)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const bytes = Buffer.from(await file.arrayBuffer());

    const prompt = `
Você é um especialista em análise de contas de energia elétrica.

Analise cuidadosamente a conta enviada e retorne um JSON EXATAMENTE neste formato:

{
  "summary": "",
  "financial": {
    "total_value": 0,
    "due_date": "",
    "is_value_high": false,
    "monthly_variation": ""
  },
  "consumption": {
    "total_kwh": 0,
    "status": "",
    "is_above_expected": false,
    "comparison": ""
  },
  "tariff": {
    "flag": "",
    "description": ""
  },
  "appliances": [],
  "waste_points": [],
  "tips": [],
  "estimated_saving": ""
}

Regras:
- Retorne APENAS o JSON.
- Sem markdown.
- Sem explicações.
- Se faltar dados, coloque null ou "".
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: bytes.toString("base64"),
                mimeType: file.type,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    let text = result.response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;

    try {
      analysis = JSON.parse(cleaned);
    } catch (error) {
      console.error("Erro ao parsear JSON:", error);
      analysis = {
        summary: "Não foi possível analisar a conta automaticamente.",
        financial: {},
        consumption: {},
        tariff: {},
        appliances: [],
        waste_points: [],
        tips: [],
        estimated_saving: "",
      };
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json(
      { error: "Erro interno ao analisar a conta." },
      { status: 500 },
    );
  }
}
