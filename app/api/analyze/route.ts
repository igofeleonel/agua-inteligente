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
      qrText = body.qrText || null;

      if (!qrText) {
        return NextResponse.json(
          { error: "QR Code inválido ou vazio." },
          { status: 400 },
        );
      }
    }

    // ---- FORM DATA (UPLOAD) ----
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
    // 1) Se veio QR CODE → manda o texto diretamente para o Gemini
    // -----------------------------------------------------
    if (qrText) {
      const prompt = `
O texto a seguir veio de um QR CODE de conta de água ou luz.

Texto do QR:
${qrText}

INTERPRETE ESSE QR CODE E RETORNE APENAS JSON:

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
  "tips": [],
  "waste_points": [],
  "estimated_saving": ""
}
`;

      const result = await model.generateContent(prompt);

      const clean = result.response.text().replace(/```json|```/g, "");
      const data = JSON.parse(clean);

      return NextResponse.json(data);
    }

    // -----------------------------------------------------
    // 2) Se veio arquivo → processar imagem normalmente
    // -----------------------------------------------------
    const buffer = Buffer.from(await file!.arrayBuffer());

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
  "tips": [],
  "waste_points": [],
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
