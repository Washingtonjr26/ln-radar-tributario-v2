"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Diagnostico {
  id: string;
  empresa: string;
  responsavel: string;
  cargo: string;
  email: string;
  whatsapp: string;
  faturamento: string;
  regime: string;
  funcionarios: string;
  estado: string;
  segmento: string;
  cnae: string;
  beneficios_fiscais: string;
  utiliza_creditos: string;
  vendas_interestaduais: string;
  percentual_interestadual: string;
  tipo_cliente: string;
  possui_filiais: string;
  possui_erp: string;
  criticidade: string;
  score_exposicao: number;
  score_complexidade: number;
  score_operacional: number;
  score_oportunidade: number;
  score_final: number;
  created_at: string;
}

interface Recomendacao {
  titulo: string;
  descricao: string;
}

interface AnaliseIA {
  parecer: string;
  riscos: string[];
  oportunidades: string[];
  recomendacoes: Recomendacao[];
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function criticidadeCor(c: string) {
  if (c?.includes("ALTA")) return { bg: "bg-red-600", text: "text-red-600", border: "border-red-200", light: "bg-red-50" };
  if (c?.includes("MÉDIA")) return { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200", light: "bg-yellow-50" };
  return { bg: "bg-green-600", text: "text-green-600", border: "border-green-200", light: "bg-green-50" };
}

function faturamentoLabel(v: string) {
  const map: Record<string, string> = {
    "360000": "Até R$ 360 mil",
    "1200000": "R$ 360 mil – R$ 1,2 mi",
    "4800000": "R$ 1,2 mi – R$ 4,8 mi",
    "10000000": "R$ 4,8 mi – R$ 10 mi",
    "50000000": "R$ 10 mi – R$ 50 mi",
    "99999999": "Acima de R$ 50 mi",
  };
  return map[v] || v;
}

function SkeletonIA() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

export default function DiagnosticoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [analiseIA, setAnaliseIA] = useState<AnaliseIA | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState("");
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("diagnosticos")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setDiagnostico(data as Diagnostico);
        gerarAnaliseIA(data as Diagnostico);
      }
      setCarregando(false);
    }
    if (id) carregar();
  }, [id]);

  async function gerarAnaliseIA(d: Diagnostico) {
    setCarregandoIA(true);
    setErroIA("");
    try {
      const res = await fetch("/api/analise-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnostico: d }),
      });
      if (!res.ok) throw new Error("Erro na API");
      const { analise } = await res.json();
      setAnaliseIA(analise);
    } catch {
      setErroIA("Não foi possível gerar a análise por IA. Exibindo análise padrão.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function baixarPDF() {
    if (!diagnostico) return;
    setGerandoPDF(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnostico,
          riscos: analiseIA?.riscos || [],
          oportunidades: analiseIA?.oportunidades || [],
          parecer: analiseIA?.parecer || "",
          recomendacoes: analiseIA?.recomendacoes || [],
        }),
      });
      if (!res.ok) throw new Error("Erro ao gerar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Diagnostico-${diagnostico.empresa.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020B2D] to-[#061B4D] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (!diagnostico) {
    return (
      <div className="min-h-screen bg-[#020B2D] flex items-center justify-center text-white text-center px-6">
        <div>
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold mb-2">Diagnóstico não encontrado</h1>
          <p className="text-gray-400 mb-6">O link pode estar incorreto ou expirado.</p>
          <button onClick={() => router.push("/")}
            className="bg-yellow-500 text-[#020B2D] font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition">
            Fazer novo diagnóstico
          </button>
        </div>
      </div>
    );
  }

  const cor = criticidadeCor(diagnostico.criticidade);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#020B2D] to-[#061B4D] text-white py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Image src="/images/logo.png" alt="Lima & Nascimento" width={160} height={60} className="h-auto" />
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Diagnóstico Estratégico</p>
            <p className="text-sm text-gray-300 mt-1">Reforma Tributária — CBS/IBS</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── BADGE IA ── */}
        {carregandoIA && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 text-sm text-blue-700">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span>Analisando o perfil da empresa com Inteligência Artificial...</span>
          </div>
        )}
        {analiseIA && !carregandoIA && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-6 text-sm text-green-700">
            ✅ <span>Análise gerada por Inteligência Artificial — personalizada para {diagnostico.empresa}</span>
          </div>
        )}
        {erroIA && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 mb-6 text-sm text-yellow-700">
            ⚠️ {erroIA}
          </div>
        )}

        {/* ── CRITICIDADE ── */}
        <div className={`rounded-2xl p-6 mb-8 border-2 ${cor.light} ${cor.border} flex items-center justify-between flex-wrap gap-4`}>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Resultado do Diagnóstico</p>
            <h1 className={`text-3xl font-bold ${cor.text}`}>{diagnostico.criticidade}</h1>
            <p className="text-gray-600 mt-1">
              {diagnostico.empresa} · {diagnostico.estado} · {diagnostico.regime}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full ${cor.bg} flex items-center justify-center flex-col`}>
              <span className="text-white text-2xl font-bold">{diagnostico.score_final}</span>
              <span className="text-white text-xs opacity-80">/ 100</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Score Final</p>
          </div>
        </div>

        {/* ── SCORES ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-[#020B2D] mb-5">Análise por Dimensão</h2>
          <div className="space-y-4">
            <ScoreBar label="Exposição Tributária" value={diagnostico.score_exposicao} color="#DC2626" />
            <ScoreBar label="Complexidade Operacional" value={diagnostico.score_complexidade} color="#D97706" />
            <ScoreBar label="Porte e Maturidade" value={diagnostico.score_operacional} color="#2563EB" />
            <ScoreBar label="Potencial de Oportunidade" value={diagnostico.score_oportunidade} color="#16A34A" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* ── PARECER ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold text-[#020B2D]">📋 Parecer Executivo</h2>
              {analiseIA && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">IA</span>}
            </div>
            {carregandoIA ? <SkeletonIA /> : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {analiseIA?.parecer || "Carregando análise..."}
              </p>
            )}
          </div>

          {/* ── DADOS ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#020B2D] mb-3">🏢 Dados da Empresa</h2>
            <div className="space-y-2 text-sm">
              {[
                ["Responsável", diagnostico.responsavel],
                ["Cargo", diagnostico.cargo],
                ["E-mail", diagnostico.email],
                ["Segmento", diagnostico.segmento],
                ["CNAE", diagnostico.cnae],
                ["Faturamento", faturamentoLabel(diagnostico.faturamento)],
                ["Funcionários", diagnostico.funcionarios],
                ["Filiais", diagnostico.possui_filiais],
                ["ERP", diagnostico.possui_erp],
                ["Tipo de Cliente", diagnostico.tipo_cliente],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* ── RISCOS ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-[#020B2D]">🔴 Riscos Identificados</h2>
              {analiseIA && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">IA</span>}
            </div>
            {carregandoIA ? <SkeletonIA /> : (
              <ul className="space-y-3">
                {(analiseIA?.riscos || []).map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">●</span>
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── OPORTUNIDADES ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-[#020B2D]">🟢 Oportunidades Identificadas</h2>
              {analiseIA && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">IA</span>}
            </div>
            {carregandoIA ? <SkeletonIA /> : (
              <ul className="space-y-3">
                {(analiseIA?.oportunidades || []).map((o, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">●</span>
                    {o}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* ── RECOMENDAÇÕES ── */}
        <div className="bg-[#020B2D] text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-xl font-bold">⚡ Recomendações Estratégicas</h2>
            {analiseIA && <span className="text-xs bg-yellow-400 text-[#020B2D] px-2 py-0.5 rounded-full font-bold">IA</span>}
          </div>
          {carregandoIA ? (
            <div className="animate-pulse grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white/10 rounded-xl p-4 space-y-2">
                  <div className="h-6 w-8 bg-white/20 rounded" />
                  <div className="h-4 bg-white/20 rounded w-3/4" />
                  <div className="h-3 bg-white/20 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {(analiseIA?.recomendacoes || [
                { titulo: "Diagnóstico Jurídico-Tributário", descricao: "Mapeamento completo da estrutura atual e simulação de impactos da Reforma." },
                { titulo: "Plano de Adequação CBS/IBS", descricao: "Roteiro personalizado de adaptação ao novo sistema tributário." },
                { titulo: "Planejamento Tributário Preventivo", descricao: "Estratégias para redução da carga tributária no período de transição 2026–2033." },
              ]).map((r, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <span className="text-yellow-400 text-2xl font-bold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-bold mt-2 mb-1 text-sm">{r.titulo}</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">{r.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center mb-8">
          <h2 className="text-2xl font-bold text-[#020B2D] mb-2">
            Seu diagnóstico está pronto.
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Agende agora uma reunião estratégica gratuita com nossos especialistas
            e receba o plano de ação personalizado para <strong>{diagnostico.empresa}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/agendamento/${diagnostico.id}`}
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition flex items-center justify-center gap-2">
              📱 Agendar via WhatsApp
            </Link>
            <button
              onClick={baixarPDF}
              disabled={gerandoPDF || carregandoIA}
              className="bg-[#020B2D] hover:bg-[#061B4D] disabled:opacity-60 text-white font-bold px-8 py-4 rounded-xl text-lg transition flex items-center justify-center gap-2">
              {gerandoPDF ? "⏳ Gerando PDF..." : carregandoIA ? "⏳ Aguarde a IA..." : "📄 Baixar Relatório PDF"}
            </button>
          </div>
        </div>

        {/* ── RODAPÉ ── */}
        <div className="text-center text-sm text-gray-400">
          <p className="font-semibold text-gray-600">Lima &amp; Nascimento Advocacia Empresarial</p>
          <p className="mt-1">contato@lnempresarial.com.br · (98) 98754-3636</p>
          <p className="mt-3 text-xs max-w-2xl mx-auto">
            Este relatório é de uso exclusivo da empresa diagnosticada, tem caráter consultivo e foi gerado
            com auxílio de Inteligência Artificial com base nas informações fornecidas. Não substitui assessoria jurídica individualizada.
          </p>
        </div>

      </div>
    </main>
  );
}
