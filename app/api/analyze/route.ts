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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const bytes = Buffer.from(await file.arrayBuffer());

    const prompt = `
    Você é um especialista em análise de contas de energia ( / qualquer distribuidora).
    Analise a conta enviada (imagem/PDF).

    Explique em português claro e direto:

    1. Valor total da conta + se aumentou comparado ao consumo médio.
    2. Consumo em kWh e se está acima do esperado.
    3. Se existe bandeira tarifária (verde, amarela, vermelha).
    4. Quais eletrodomésticos podem estar elevando o consumo.
    5. Se o valor está coerente ou se parece errado.
    6. Pontos de desperdício possíveis.
    7. Dicas práticas e personalizadas para economizar.
    8. Uma estimativa de quanto a pessoa pode economizar por mês.

    IMPORTANTE:
  - Responda APENAS em texto natural (NÃO use JSON).
  - Seja direto, amigável e fácil de entender.
  - Gere um relatório completo e profissional.
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

    const text = result.response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao analisar a conta." },
      { status: 500 },
    );
  }
}
