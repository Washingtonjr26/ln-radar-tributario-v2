import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { diagnostico } = await req.json();

    if (!diagnostico) {
      return NextResponse.json({ error: "Dados ausentes." }, { status: 400 });
    }

    const faturamentoLabel: Record<string, string> = {
      "360000": "até R$ 360 mil",
      "1200000": "entre R$ 360 mil e R$ 1,2 milhão",
      "4800000": "entre R$ 1,2 milhão e R$ 4,8 milhões",
      "10000000": "entre R$ 4,8 milhões e R$ 10 milhões",
      "50000000": "entre R$ 10 milhões e R$ 50 milhões",
      "99999999": "acima de R$ 50 milhões",
    };

    const prompt = `Você é um especialista sênior em direito tributário brasileiro com foco na Reforma Tributária (LC 214/2024 — CBS/IBS).

Analise o seguinte perfil empresarial e gere um diagnóstico tributário estratégico INDIVIDUALIZADO e TÉCNICO:

DADOS DA EMPRESA:
- Empresa: ${diagnostico.empresa}
- Segmento: ${diagnostico.segmento || "Não informado"}
- CNAE Principal: ${diagnostico.cnae || "Não informado"}
- Estado: ${diagnostico.estado}
- Regime Tributário: ${diagnostico.regime}
- Faturamento Anual: ${faturamentoLabel[diagnostico.faturamento] || diagnostico.faturamento}
- Número de Funcionários: ${diagnostico.funcionarios || "Não informado"}
- Possui Benefícios Fiscais: ${diagnostico.beneficios_fiscais}
- Utiliza Créditos Tributários: ${diagnostico.utiliza_creditos}
- Realiza Vendas Interestaduais: ${diagnostico.vendas_interestaduais}
- Percentual Interestadual: ${diagnostico.percentual_interestadual || "0"}%
- Perfil de Clientes: ${diagnostico.tipo_cliente}
- Possui Filiais: ${diagnostico.possui_filiais}
- Utiliza ERP: ${diagnostico.possui_erp}
- Score Final: ${diagnostico.score_final}/100
- Classificação: ${diagnostico.criticidade}

INSTRUÇÕES:
- Use linguagem executiva, direta e técnica
- Seja ESPECÍFICO ao segmento e CNAE informados
- Mencione CBS, IBS, IS (Imposto Seletivo) quando relevante
- Cite o período de transição 2026-2033 quando pertinente
- Não use frases genéricas — cada item deve ser específico para este perfil

Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:

{
  "parecer": "Texto do parecer executivo com 3-4 frases técnicas e específicas para esta empresa",
  "riscos": [
    "Risco específico 1 — detalhado e técnico",
    "Risco específico 2 — detalhado e técnico",
    "Risco específico 3 — detalhado e técnico",
    "Risco específico 4 — detalhado e técnico"
  ],
  "oportunidades": [
    "Oportunidade específica 1 — com potencial de ganho estimado",
    "Oportunidade específica 2 — com potencial de ganho estimado",
    "Oportunidade específica 3 — com potencial de ganho estimado",
    "Oportunidade específica 4 — com potencial de ganho estimado"
  ],
  "recomendacoes": [
    {
      "titulo": "Título da recomendação 1",
      "descricao": "Descrição detalhada da ação recomendada com prazo e impacto esperado"
    },
    {
      "titulo": "Título da recomendação 2",
      "descricao": "Descrição detalhada da ação recomendada com prazo e impacto esperado"
    },
    {
      "titulo": "Título da recomendação 3",
      "descricao": "Descrição detalhada da ação recomendada com prazo e impacto esperado"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Remove possíveis marcadores markdown antes de parsear
    const clean = content.replace(/```json|```/g, "").trim();
    const analise = JSON.parse(clean);

    return NextResponse.json({ analise });
  } catch (err) {
    console.error("Erro na análise IA:", err);
    return NextResponse.json(
      { error: "Erro ao gerar análise. Tente novamente." },
      { status: 500 }
    );
  }
}
