"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_PIPELINE = [
  { id: "Novo Lead", label: "Novo Lead", cor: "bg-gray-100 border-gray-300", corTitulo: "text-gray-600", corBadge: "bg-gray-200 text-gray-700" },
  { id: "Contato Realizado", label: "Contato Realizado", cor: "bg-blue-50 border-blue-200", corTitulo: "text-blue-700", corBadge: "bg-blue-100 text-blue-700" },
  { id: "Reunião Agendada", label: "Reunião Agendada", cor: "bg-yellow-50 border-yellow-200", corTitulo: "text-yellow-700", corBadge: "bg-yellow-100 text-yellow-700" },
  { id: "Proposta Enviada", label: "Proposta Enviada", cor: "bg-orange-50 border-orange-200", corTitulo: "text-orange-700", corBadge: "bg-orange-100 text-orange-700" },
  { id: "Contrato Fechado", label: "Contrato Fechado", cor: "bg-green-50 border-green-200", corTitulo: "text-green-700", corBadge: "bg-green-100 text-green-700" },
  { id: "Perdido", label: "Perdido", cor: "bg-red-50 border-red-200", corTitulo: "text-red-700", corBadge: "bg-red-100 text-red-700" },
];

interface Diagnostico {
  id: string;
  empresa: string;
  responsavel: string;
  email: string;
  whatsapp: string;
  estado: string;
  regime: string;
  segmento: string;
  criticidade: string;
  score_final: number;
  faturamento: string;
}

interface CrmRecord {
  id: string;
  diagnostico_id: string;
  status: string;
  observacoes: string;
  proxima_acao: string;
  data_followup: string;
  responsavel_crm: string;
  updated_at: string;
}

interface Lead extends Diagnostico {
  crm?: CrmRecord;
}

function criticidadeBadge(c: string) {
  if (c?.includes("ALTA")) return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">Alta</span>;
  if (c?.includes("MÉDIA")) return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">Média</span>;
  return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Baixa</span>;
}

function dataFormatada(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState<Lead | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [visualizacao, setVisualizacao] = useState<"kanban" | "lista">("kanban");
  const [busca, setBusca] = useState("");

  // Form do modal
  const [formCrm, setFormCrm] = useState({
    status: "Novo Lead",
    observacoes: "",
    proxima_acao: "",
    data_followup: "",
    responsavel_crm: "",
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);

    const { data: diagnosticos } = await supabase
      .from("diagnosticos")
      .select("id, empresa, responsavel, email, whatsapp, estado, regime, segmento, criticidade, score_final, faturamento")
      .order("created_at", { ascending: false });

    const { data: crms } = await supabase
      .from("crm")
      .select("*");

    if (diagnosticos) {
      const merged: Lead[] = diagnosticos.map((d: any) => ({
        ...d,
        crm: crms?.find((c: CrmRecord) => String(c.diagnostico_id) === String(d.id)),
      }));
      setLeads(merged);
    }

    setCarregando(false);
  }

  function abrirModal(lead: Lead) {
    setModalAberto(lead);
    setFormCrm({
      status: lead.crm?.status || "Novo Lead",
      observacoes: lead.crm?.observacoes || "",
      proxima_acao: lead.crm?.proxima_acao || "",
      data_followup: lead.crm?.data_followup || "",
      responsavel_crm: lead.crm?.responsavel_crm || "",
    });
  }

  async function salvarCrm() {
    if (!modalAberto) return;
    setSalvando(true);

    const payload = {
      diagnostico_id: modalAberto.id,
      ...formCrm,
      updated_at: new Date().toISOString(),
    };

    if (modalAberto.crm?.id) {
      await supabase.from("crm").update(payload).eq("id", modalAberto.crm.id);
    } else {
      await supabase.from("crm").insert([payload]);
    }

    setSalvando(false);
    setModalAberto(null);
    await carregar();
  }

  async function moverStatus(lead: Lead, novoStatus: string) {
    const payload = {
      diagnostico_id: lead.id,
      status: novoStatus,
      updated_at: new Date().toISOString(),
    };

    if (lead.crm?.id) {
      await supabase.from("crm").update(payload).eq("id", lead.crm.id);
    } else {
      await supabase.from("crm").insert([payload]);
    }

    await carregar();
  }

  const leadsFiltrados = useMemo(() => {
    if (!busca) return leads;
    return leads.filter(
      (l) =>
        l.empresa?.toLowerCase().includes(busca.toLowerCase()) ||
        l.responsavel?.toLowerCase().includes(busca.toLowerCase()) ||
        l.estado?.toLowerCase().includes(busca.toLowerCase())
    );
  }, [leads, busca]);

  const leadsPorStatus = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STATUS_PIPELINE.forEach((s) => { map[s.id] = []; });
    leadsFiltrados.forEach((l) => {
      const status = l.crm?.status || "Novo Lead";
      if (map[status]) map[status].push(l);
      else map["Novo Lead"].push(l);
    });
    return map;
  }, [leadsFiltrados]);

  const metricas = useMemo(() => ({
    total: leads.length,
    novos: leads.filter((l) => !l.crm || l.crm.status === "Novo Lead").length,
    reunioes: leads.filter((l) => l.crm?.status === "Reunião Agendada").length,
    fechados: leads.filter((l) => l.crm?.status === "Contrato Fechado").length,
    perdidos: leads.filter((l) => l.crm?.status === "Perdido").length,
  }), [leads]);

  // Leads com follow-up hoje ou vencido
  const followupsHoje = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];
    return leads.filter((l) => l.crm?.data_followup && l.crm.data_followup <= hoje && l.crm.status !== "Contrato Fechado" && l.crm.status !== "Perdido");
  }, [leads]);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#020B2D] to-[#061B4D] text-white px-8 py-6">
        <div className="max-w-full mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-yellow-400 uppercase tracking-widest mb-1">Lima & Nascimento</p>
            <h1 className="text-2xl font-bold">CRM — Pipeline Comercial</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition">
              ← Dashboard
            </Link>
            <button
              onClick={() => setVisualizacao(v => v === "kanban" ? "lista" : "kanban")}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition">
              {visualizacao === "kanban" ? "📋 Lista" : "🗂 Kanban"}
            </button>
            <button onClick={carregar}
              className="bg-yellow-500 hover:bg-yellow-400 text-[#020B2D] font-bold px-4 py-2 rounded-lg text-sm transition">
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">

        {/* ── MÉTRICAS ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 max-w-full">
          {[
            { label: "Total de Leads", valor: metricas.total, cor: "text-[#020B2D]" },
            { label: "Novos Leads", valor: metricas.novos, cor: "text-gray-600" },
            { label: "Reuniões", valor: metricas.reunioes, cor: "text-yellow-600" },
            { label: "Contratos Fechados", valor: metricas.fechados, cor: "text-green-600" },
            { label: "Perdidos", valor: metricas.perdidos, cor: "text-red-600" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{c.label}</p>
              <p className={`text-3xl font-bold ${c.cor}`}>{c.valor}</p>
            </div>
          ))}
        </div>

        {/* ── ALERTAS DE FOLLOW-UP ── */}
        {followupsHoje.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-orange-500 text-xl flex-shrink-0">⏰</span>
            <div>
              <p className="font-bold text-orange-700 text-sm">
                {followupsHoje.length} follow-up{followupsHoje.length > 1 ? "s" : ""} pendente{followupsHoje.length > 1 ? "s" : ""}
              </p>
              <p className="text-orange-600 text-xs mt-1">
                {followupsHoje.map((l) => l.empresa).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* ── BUSCA ── */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Buscar empresa, responsável ou estado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-[#020B2D] bg-white"
          />
        </div>

        {carregando ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#020B2D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Carregando pipeline...
          </div>
        ) : (

          <>
            {/* ══════════════ KANBAN ══════════════ */}
            {visualizacao === "kanban" && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {STATUS_PIPELINE.map((col) => (
                  <div key={col.id} className="flex-shrink-0 w-72">

                    {/* Cabeçalho da coluna */}
                    <div className={`rounded-xl border-2 ${col.cor} p-3 mb-3 flex items-center justify-between`}>
                      <span className={`font-bold text-sm ${col.corTitulo}`}>{col.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.corBadge}`}>
                        {leadsPorStatus[col.id]?.length || 0}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3 min-h-24">
                      {(leadsPorStatus[col.id] || []).map((lead) => (
                        <div key={lead.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                          onClick={() => abrirModal(lead)}>

                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-800 truncate">{lead.empresa}</p>
                              <p className="text-xs text-gray-400 truncate">{lead.responsavel}</p>
                            </div>
                            {criticidadeBadge(lead.criticidade)}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span>{lead.estado} · {lead.regime}</span>
                            <span className="font-bold text-[#020B2D]">{lead.score_final}/100</span>
                          </div>

                          {lead.crm?.proxima_acao && (
                            <div className="bg-blue-50 rounded-lg px-2 py-1.5 mb-2">
                              <p className="text-xs text-blue-700 font-semibold">→ {lead.crm.proxima_acao}</p>
                            </div>
                          )}

                          {lead.crm?.data_followup && (
                            <p className={`text-xs ${
                              lead.crm.data_followup <= new Date().toISOString().split("T")[0]
                                ? "text-red-500 font-bold"
                                : "text-gray-400"
                            }`}>
                              📅 {dataFormatada(lead.crm.data_followup)}
                            </p>
                          )}

                          <div className="flex gap-1 mt-3 flex-wrap">
                            {STATUS_PIPELINE.filter((s) => s.id !== col.id).map((s) => (
                              <button
                                key={s.id}
                                onClick={(e) => { e.stopPropagation(); moverStatus(lead, s.id); }}
                                className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 transition truncate max-w-20"
                                title={`Mover para ${s.label}`}>
                                → {s.label.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {(leadsPorStatus[col.id] || []).length === 0 && (
                        <div className="text-center py-6 text-gray-300 text-xs border-2 border-dashed border-gray-200 rounded-xl">
                          Nenhum lead aqui
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══════════════ LISTA ══════════════ */}
            {visualizacao === "lista" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contato</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Próxima Ação</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Follow-up</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsFiltrados.map((lead) => {
                      const status = lead.crm?.status || "Novo Lead";
                      const col = STATUS_PIPELINE.find((s) => s.id === status);
                      return (
                        <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <p className="font-bold text-sm text-gray-800">{lead.empresa}</p>
                            <p className="text-xs text-gray-400">{lead.estado} · {lead.regime}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700">{lead.responsavel}</p>
                            <p className="text-xs text-gray-400">{lead.whatsapp}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-[#020B2D]">{lead.score_final}/100</span>
                            <div className="mt-1">{criticidadeBadge(lead.criticidade)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${col?.corBadge}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-40">
                            {lead.crm?.proxima_acao || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {lead.crm?.data_followup ? (
                              <span className={`text-xs font-semibold ${
                                lead.crm.data_followup <= new Date().toISOString().split("T")[0]
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}>
                                {dataFormatada(lead.crm.data_followup)}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => abrirModal(lead)}
                                className="bg-[#020B2D] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#061B4D] transition">
                                Editar
                              </button>
                              <Link href={`/diagnostico/${lead.id}`}
                                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition">
                                Ver
                              </Link>
                              <a href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g, "")}`}
                                target="_blank" rel="noopener noreferrer"
                                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition">
                                WA
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════ MODAL ══════════════ */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">

            {/* Header do modal */}
            <div className="bg-gradient-to-r from-[#020B2D] to-[#061B4D] text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg">{modalAberto.empresa}</h2>
                  <p className="text-blue-200 text-sm mt-1">{modalAberto.responsavel} · {modalAberto.whatsapp}</p>
                  <p className="text-blue-300 text-xs mt-1">{modalAberto.estado} · {modalAberto.regime} · Score: {modalAberto.score_final}/100</p>
                </div>
                <button onClick={() => setModalAberto(null)} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>

            <div className="p-6 space-y-4">

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status no Pipeline</label>
                <select
                  value={formCrm.status}
                  onChange={(e) => setFormCrm({ ...formCrm, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]">
                  {STATUS_PIPELINE.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Responsável pelo Lead</label>
                <input
                  value={formCrm.responsavel_crm}
                  onChange={(e) => setFormCrm({ ...formCrm, responsavel_crm: e.target.value })}
                  placeholder="Ex: Dr. Washington"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]"
                />
              </div>

              {/* Próxima ação */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Próxima Ação</label>
                <input
                  value={formCrm.proxima_acao}
                  onChange={(e) => setFormCrm({ ...formCrm, proxima_acao: e.target.value })}
                  placeholder="Ex: Enviar proposta por e-mail"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]"
                />
              </div>

              {/* Data de follow-up */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Follow-up</label>
                <input
                  type="date"
                  value={formCrm.data_followup}
                  onChange={(e) => setFormCrm({ ...formCrm, data_followup: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D]"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formCrm.observacoes}
                  onChange={(e) => setFormCrm({ ...formCrm, observacoes: e.target.value })}
                  placeholder="Anotações sobre o contato, histórico, objeções..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D] resize-none"
                />
              </div>

              {/* Ações rápidas */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <a href={`https://wa.me/55${modalAberto.whatsapp?.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold py-2.5 rounded-xl text-center transition">
                  📱 WhatsApp
                </a>
                <a href={`mailto:${modalAberto.email}`}
                  className="flex-1 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded-xl text-center transition">
                  ✉️ E-mail
                </a>
                <Link href={`/diagnostico/${modalAberto.id}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl text-center transition">
                  📋 Diagnóstico
                </Link>
              </div>

              {/* Botões salvar/cancelar */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalAberto(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={salvarCrm} disabled={salvando}
                  className="flex-1 bg-[#020B2D] hover:bg-[#061B4D] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition">
                  {salvando ? "Salvando..." : "💾 Salvar"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
