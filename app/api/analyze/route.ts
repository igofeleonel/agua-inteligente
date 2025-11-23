/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

// This API route simulates the backend logic you requested (replacing server.js)
// In a real production environment, this would connect to the Gemini API
export async function POST(request: Request) {
  // Simulate processing delay like a real AI analysis
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // In a real implementation:
    // const formData = await request.formData();
    // const file = formData.get('file');
    // const result = await gemini.analyze(file);

    // Mock response following the requested JSON structure
    const mockResponse = {
      status: "success",
      meta: {
        provider: "Google Gemini",
        model: "gemini-1.5-pro",
        timestamp: new Date().toISOString(),
        server: "Next.js Route Handler (Express-like)",
      },
      analysis: {
        customer: "Usuário Exemplo",
        month: "Junho/2025",
        consumption: {
          total_m3: 10,
          avg_daily_liters: 333,
          status: "HIGH",
          comparison: "+15% vs vizinhos",
        },
        financial: {
          total_value: 145.5,
          currency: "BRL",
          due_date: "2025-06-15",
        },
        insights: [
          "Consumo 15% acima da média do bairro",
          "Possível vazamento detectado (padrão noturno)",
          "Redução sugerida: 2m³ (R$ 29,00 economia)",
        ],
        action_items: [
          {
            action: "Verificar válvula hydra",
            priority: "HIGH",
            potential_saving: "R$ 15,00",
          },
          {
            action: "Instalar aerador na pia",
            priority: "MEDIUM",
            potential_saving: "R$ 5,00",
          },
          {
            action: "Reduzir banho em 2 min",
            priority: "HIGH",
            potential_saving: "R$ 9,00",
          },
        ],
      },
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha na análise do arquivo" },
      { status: 500 },
    );
  }
}
