"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

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
  criticidade: string;
  score_exposicao: number;
  score_complexidade: number;
  score_operacional: number;
  score_oportunidade: number;
  score_final: number;
  created_at: string;
}

function faturamentoLabel(v: string) {
  const map: Record<string, string> = {
    "360000": "Até R$ 360k",
    "1200000": "R$ 360k–1,2mi",
    "4800000": "R$ 1,2–4,8mi",
    "10000000": "R$ 4,8–10mi",
    "50000000": "R$ 10–50mi",
    "99999999": "+R$ 50mi",
  };
  return map[v] || v;
}

function criticidadeBadge(c: string) {
  if (c?.includes("ALTA"))
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">🔴 Alta</span>;
  if (c?.includes("MÉDIA"))
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">🟡 Média</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">🟢 Baixa</span>;
}

function ScoreMini({ valor, cor }: { valor: number; cor: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${valor}%`, backgroundColor: cor }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color: cor }}>{valor}</span>
    </div>
  );
}

function BarChart({ dados, cor }: { dados: { label: string; valor: number }[]; cor: string }) {
  const max = Math.max(...dados.map((d) => d.valor), 1);
  return (
    <div className="space-y-2">
      {dados.slice(0, 8).map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 truncate flex-shrink-0">{d.label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{ width: `${(d.valor / max) * 100}%`, backgroundColor: cor }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 w-6 text-right">{d.valor}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCriticidade, setFiltroCriticidade] = useState("Todos");
  const [filtroRegime, setFiltroRegime] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState<"score_final" | "created_at">("created_at");
  const [abaSelecionada, setAbaSelecionada] = useState<"tabela" | "ranking" | "graficos">("tabela");

  useEffect(() => {
    carregarDiagnosticos();
  }, []);

  async function carregarDiagnosticos() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDiagnosticos(data as Diagnostico[]);
    setCarregando(false);
  }

  // ── MÉTRICAS ──
  const metricas = useMemo(() => {
    const alta = diagnosticos.filter((d) => d.criticidade?.includes("ALTA")).length;
    const media = diagnosticos.filter((d) => d.criticidade?.includes("MÉDIA")).length;
    const baixa = diagnosticos.filter((d) => d.criticidade?.includes("BAIXA")).length;
    const validos = diagnosticos.filter((d) => d.score_final > 0);
const scoreMedio = validos.length
  ? Math.round(validos.reduce((acc, d) => acc + d.score_final, 0) / validos.length)
  : 0;
    return { alta, media, baixa, scoreMedio };
  }, [diagnosticos]);

  // ── GRÁFICOS ──
  const porEstado = useMemo(() => {
    const map: Record<string, number> = {};
    diagnosticos.forEach((d) => { if (d.estado) map[d.estado] = (map[d.estado] || 0) + 1; });
    return Object.entries(map).map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  }, [diagnosticos]);

  const porSegmento = useMemo(() => {
    const map: Record<string, number> = {};
    diagnosticos.forEach((d) => { if (d.segmento) map[d.segmento] = (map[d.segmento] || 0) + 1; });
    return Object.entries(map).map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  }, [diagnosticos]);

  const porRegime = useMemo(() => {
    const map: Record<string, number> = {};
    diagnosticos.forEach((d) => { if (d.regime) map[d.regime] = (map[d.regime] || 0) + 1; });
    return Object.entries(map).map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  }, [diagnosticos]);

  const porCriticidade = [
    { label: "Alta", valor: metricas.alta },
    { label: "Média", valor: metricas.media },
    { label: "Baixa", valor: metricas.baixa },
  ];

  // ── FILTROS ──
  const diagnosticosFiltrados = useMemo(() => {
    return diagnosticos
      .filter((d) => {
        const matchBusca =
          !busca ||
          d.empresa?.toLowerCase().includes(busca.toLowerCase()) ||
          d.responsavel?.toLowerCase().includes(busca.toLowerCase()) ||
          d.estado?.toLowerCase().includes(busca.toLowerCase());
        const matchCriticidade =
          filtroCriticidade === "Todos" || d.criticidade?.includes(filtroCriticidade);
        const matchRegime =
          filtroRegime === "Todos" || d.regime === filtroRegime;
        return matchBusca && matchCriticidade && matchRegime;
      })
      .sort((a, b) => {
        if (ordenacao === "score_final") return (b.score_final || 0) - (a.score_final || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [diagnosticos, busca, filtroCriticidade, filtroRegime, ordenacao]);

  // ── RANKING ──
  const ranking = useMemo(() => {
    return [...diagnosticos]
      .sort((a, b) => (b.score_final || 0) - (a.score_final || 0))
      .slice(0, 10);
  }, [diagnosticos]);

  const dataFormatada = (iso: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#020B2D] to-[#061B4D] text-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-yellow-400 uppercase tracking-widest mb-1">Lima & Nascimento</p>
            <h1 className="text-2xl font-bold">LN Radar Tributário — Painel Comercial</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={carregarDiagnosticos}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
              🔄 Atualizar
            </button>
           <Link href="/crm" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition">
  🗂 CRM
</Link>
<Link href="/" className="bg-yellow-500 hover:bg-yellow-400 text-[#020B2D] font-bold px-4 py-2 rounded-lg text-sm transition">
  + Novo Diagnóstico
</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── CARDS DE MÉTRICAS ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total de Leads", valor: diagnosticos.length, cor: "text-[#020B2D]", bg: "bg-white" },
            { label: "Alta Criticidade", valor: metricas.alta, cor: "text-red-600", bg: "bg-red-50" },
            { label: "Média Criticidade", valor: metricas.media, cor: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Baixa Criticidade", valor: metricas.baixa, cor: "text-green-600", bg: "bg-green-50" },
            { label: "Score Médio", valor: `${metricas.scoreMedio}/100`, cor: "text-blue-600", bg: "bg-blue-50" },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} rounded-xl p-5 shadow-sm border border-gray-100`}>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.cor}`}>{card.valor}</p>
            </div>
          ))}
        </div>

        {/* ── ABAS ── */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "tabela", label: "📋 Todos os Leads" },
            { id: "ranking", label: "🏆 Leads Mais Quentes" },
            { id: "graficos", label: "📊 Gráficos" },
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaSelecionada(aba.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                abaSelecionada === aba.id
                  ? "bg-[#020B2D] text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}>
              {aba.label}
            </button>
          ))}
        </div>

        {/* ══════════════ ABA TABELA ══════════════ */}
        {abaSelecionada === "tabela" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Filtros */}
            <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Buscar empresa, responsável ou estado..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-[#020B2D]"
              />
              <select
                value={filtroCriticidade}
                onChange={(e) => setFiltroCriticidade(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]">
                <option>Todos</option>
                <option value="ALTA">Alta Criticidade</option>
                <option value="MÉDIA">Média Criticidade</option>
                <option value="BAIXA">Baixa Criticidade</option>
              </select>
              <select
                value={filtroRegime}
                onChange={(e) => setFiltroRegime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]">
                <option>Todos</option>
                <option>Simples Nacional</option>
                <option>Lucro Presumido</option>
                <option>Lucro Real</option>
              </select>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]">
                <option value="created_at">Mais recentes</option>
                <option value="score_final">Maior score</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto">
                {diagnosticosFiltrados.length} resultado{diagnosticosFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {carregando ? (
                <div className="p-10 text-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-[#020B2D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Carregando diagnósticos...
                </div>
              ) : diagnosticosFiltrados.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  Nenhum diagnóstico encontrado.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contato</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado / Regime</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Faturamento</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Criticidade</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Score Final</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosticosFiltrados.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-sm text-gray-800">{item.empresa}</p>
                          <p className="text-xs text-gray-400">{item.segmento}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{item.responsavel}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                          <p className="text-xs text-gray-400">{item.whatsapp}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-700">{item.estado}</p>
                          <p className="text-xs text-gray-400">{item.regime}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {faturamentoLabel(item.faturamento)}
                        </td>
                        <td className="px-4 py-3">
                          {criticidadeBadge(item.criticidade)}
                        </td>
                        <td className="px-4 py-3 w-28">
                          <ScoreMini valor={item.score_final || 0} cor="#020B2D" />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {dataFormatada(item.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/diagnostico/${item.id}`}
                              className="bg-[#020B2D] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#061B4D] transition">
                              Ver
                            </Link>
                            <a
                              href={`https://wa.me/55${item.whatsapp?.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition">
                              WA
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ ABA RANKING ══════════════ */}
        {abaSelecionada === "ranking" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#020B2D]">🏆 Top 10 Leads por Score Final</h2>
              <p className="text-xs text-gray-400 mt-1">Ordenados por maior potencial de negócio</p>
            </div>
            <div className="divide-y divide-gray-50">
              {ranking.map((item, i) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400 text-[#020B2D]" :
                    i === 1 ? "bg-gray-300 text-gray-700" :
                    i === 2 ? "bg-orange-300 text-white" :
                    "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{item.empresa}</p>
                    <p className="text-xs text-gray-400">{item.estado} · {item.regime} · {item.segmento}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.responsavel} · {item.whatsapp}</p>
                  </div>

                  <div className="hidden md:block w-48 space-y-1">
                    <ScoreMini valor={item.score_exposicao || 0} cor="#DC2626" />
                    <ScoreMini valor={item.score_complexidade || 0} cor="#D97706" />
                    <ScoreMini valor={item.score_oportunidade || 0} cor="#16A34A" />
                  </div>

                  <div className="text-center flex-shrink-0">
                    <div className="text-2xl font-bold text-[#020B2D]">{item.score_final}</div>
                    <div className="text-xs text-gray-400">score</div>
                  </div>

                  <div className="flex-shrink-0">
                    {criticidadeBadge(item.criticidade)}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/diagnostico/${item.id}`}
                      className="bg-[#020B2D] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#061B4D] transition">
                      Ver
                    </Link>
                    <a href={`https://wa.me/55${item.whatsapp?.replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition">
                      WA
                    </a>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && (
                <div className="p-10 text-center text-gray-400">Nenhum diagnóstico encontrado.</div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ ABA GRÁFICOS ══════════════ */}
        {abaSelecionada === "graficos" && (
          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#020B2D] mb-4">Por Criticidade</h3>
              <BarChart dados={porCriticidade} cor="#020B2D" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#020B2D] mb-4">Por Regime Tributário</h3>
              <BarChart dados={porRegime} cor="#2563EB" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#020B2D] mb-4">Por Estado</h3>
              <BarChart dados={porEstado} cor="#D97706" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#020B2D] mb-4">Por Segmento</h3>
              <BarChart dados={porSegmento} cor="#16A34A" />
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
