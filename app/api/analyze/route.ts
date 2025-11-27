import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da API Gemini não configurada" },
        { status: 500 },
      );
    }

    const prompt = `
      Analyze this utility bill (electricity or water) image.
      Extract the following information and return ONLY a JSON object with this structure:
      {
        "analysis": {
          "customer": "Customer Name (if found, else 'Não identificado')",
          "month": "Reference Month (e.g., 'Junho/2025')",
          "consumption": {
            "total_m3": number (if water, else null),
            "total_kwh": number (if electricity, else null),
            "avg_daily": number (estimate based on total / 30),
            "status": "HIGH" | "MEDIUM" | "LOW" (assess based on typical household consumption),
            "comparison": "string (e.g., '+15% vs vizinhos' - make a plausible estimate or extract if available)"
          },
          "financial": {
            "total_value": number,
            "currency": "BRL",
            "due_date": "YYYY-MM-DD"
          },
          "insights": [
            "string (insight 1)",
            "string (insight 2)",
            "string (insight 3)"
          ],
          "action_items": [
            {
              "action": "string (short action title)",
              "priority": "HIGH" | "MEDIUM" | "LOW",
              "potential_saving": "string (estimated saving value)"
            }
          ]
        }
      }
      
      Focus on finding opportunities for savings. If it's an electricity bill, suggest actions like 'Switch to LED', 'Check fridge seal'. If water, 'Check leaks', 'Install aerators'.
      IMPORTANT: All text fields (customer, insights, action items, comparison, etc.) MUST be in Portuguese.
      Do not include markdown formatting like \`\`\`json \`\`\`. Just the raw JSON string.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "Erro ao processar com Gemini API", details: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Resposta vazia do Gemini");
    }

    const cleanJson = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Erro na análise:", error);
    return NextResponse.json(
      { error: "Falha na análise do arquivo" },
      { status: 500 },
    );
  }
}
