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

const WHATSAPP = "5598987543636";

interface Diagnostico {
  id: string;
  empresa: string;
  responsavel: string;
  cargo: string;
  email: string;
  whatsapp: string;
  estado: string;
  regime: string;
  segmento: string;
  criticidade: string;
  score_final: number;
  score_exposicao: number;
  score_oportunidade: number;
}

function criticidadeCor(c: string) {
  if (c?.includes("ALTA")) return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-600" };
  if (c?.includes("MÉDIA")) return { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-500" };
  return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200", badge: "bg-green-600" };
}

const HORARIOS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const ASSUNTOS = [
  "Adequação à Reforma Tributária (CBS/IBS)",
  "Recuperação de Créditos Tributários",
  "Planejamento Tributário Preventivo",
  "Reorganização Societária / Holding",
  "Revisão do Regime Tributário",
  "Diagnóstico Completo da Empresa",
];

export default function AgendamentoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [horario, setHorario] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagemExtra, setMensagemExtra] = useState("");
  const [etapa, setEtapa] = useState(1);

  useEffect(() => {
    async function carregar() {
      if (!id) return;
      const { data } = await supabase
        .from("diagnosticos")
        .select("id, empresa, responsavel, cargo, email, whatsapp, estado, regime, segmento, criticidade, score_final, score_exposicao, score_oportunidade")
        .eq("id", id)
        .single();
      if (data) setDiagnostico(data as Diagnostico);
      setCarregando(false);
    }
    carregar();
  }, [id]);

  function abrirWhatsApp() {
    if (!diagnostico) return;

    const linhaHorario = horario ? `\n⏰ *Preferência de horário:* ${horario}` : "";
    const linhaAssunto = assunto ? `\n📌 *Assunto principal:* ${assunto}` : "";
    const linhaExtra = mensagemExtra ? `\n💬 *Observação:* ${mensagemExtra}` : "";

    const mensagem = encodeURIComponent(
      `Olá, Lima & Nascimento! 👋\n\n` +
      `Acabei de realizar o *Diagnóstico Tributário LN Radar* e gostaria de agendar uma reunião estratégica.\n\n` +
      `📊 *Resultado do Diagnóstico:*\n` +
      `• Empresa: *${diagnostico.empresa}*\n` +
      `• Responsável: ${diagnostico.responsavel}${diagnostico.cargo ? ` (${diagnostico.cargo})` : ""}\n` +
      `• Estado: ${diagnostico.estado} · Regime: ${diagnostico.regime}\n` +
      `• Segmento: ${diagnostico.segmento}\n` +
      `• Classificação: *${diagnostico.criticidade}*\n` +
      `• Score Final: *${diagnostico.score_final}/100*` +
      linhaHorario +
      linhaAssunto +
      linhaExtra +
      `\n\nAguardo o contato para agendar a reunião. Obrigado!`
    );

    window.open(`https://wa.me/${WHATSAPP}?text=${mensagem}`, "_blank");
    setEtapa(3);
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020B2D] to-[#061B4D] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!diagnostico) {
    return (
      <div className="min-h-screen bg-[#020B2D] flex items-center justify-center text-white text-center px-6">
        <div>
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold mb-4">Diagnóstico não encontrado</h1>
          <button onClick={() => router.push("/")}
            className="bg-yellow-500 text-[#020B2D] font-bold px-8 py-3 rounded-xl">
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
      <div className="bg-gradient-to-r from-[#020B2D] to-[#061B4D] text-white py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Image src="/images/logo.png" alt="Lima & Nascimento" width={140} height={50} className="h-auto" />
          <Link href={`/diagnostico/${id}`}
            className="text-sm text-gray-300 hover:text-white transition">
            ← Voltar ao diagnóstico
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* ══════════════ ETAPA 1 — RESUMO + OPÇÕES ══════════════ */}
        {etapa === 1 && (
          <>
            {/* Resumo do diagnóstico */}
            <div className={`rounded-2xl p-6 mb-8 border-2 ${cor.bg} ${cor.border}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Seu Diagnóstico
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className={`text-2xl font-bold ${cor.text}`}>{diagnostico.criticidade}</h1>
                  <p className="text-gray-600 mt-1">{diagnostico.empresa} · {diagnostico.estado} · {diagnostico.regime}</p>
                </div>
                <div className={`${cor.badge} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className="text-xl font-bold">{diagnostico.score_final}</span>
                  <span className="text-xs opacity-80">/100</span>
                </div>
              </div>
            </div>

            {/* CTA principal */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#020B2D] mb-3">
                Agende sua Reunião Estratégica
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Nossa equipe vai analisar o diagnóstico de <strong>{diagnostico.empresa}</strong> e apresentar
                o plano de adequação personalizado à Reforma Tributária.
              </p>
            </div>

            {/* Cards de benefícios */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: "🆓", titulo: "Gratuita", desc: "Reunião 100% gratuita, sem compromisso" },
                { icon: "⚡", titulo: "Rápida", desc: "30 minutos de análise objetiva" },
                { icon: "🎯", titulo: "Personalizada", desc: "Plano específico para seu perfil" },
              ].map((b) => (
                <div key={b.titulo} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl mb-2">{b.icon}</p>
                  <p className="font-bold text-[#020B2D]">{b.titulo}</p>
                  <p className="text-sm text-gray-500 mt-1">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setEtapa(2)}
                className="bg-green-500 hover:bg-green-400 text-white font-bold px-12 py-5 rounded-2xl text-xl transition shadow-lg shadow-green-200">
                📱 Agendar via WhatsApp
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Você será direcionado para o WhatsApp com a mensagem já preenchida
              </p>
            </div>
          </>
        )}

        {/* ══════════════ ETAPA 2 — PERSONALIZAÇÃO ══════════════ */}
        {etapa === 2 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#020B2D]">Personalize sua mensagem</h2>
              <p className="text-gray-500 mt-2">Opcional — facilita o agendamento</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">

              {/* Horário preferido */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  ⏰ Horário de preferência
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorario(h === horario ? "" : h)}
                      className={`py-2 rounded-lg text-sm font-semibold transition border ${
                        horario === h
                          ? "bg-[#020B2D] text-white border-[#020B2D]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#020B2D]"
                      }`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assunto */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📌 Assunto principal
                </label>
                <div className="space-y-2">
                  {ASSUNTOS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAssunto(a === assunto ? "" : a)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition border ${
                        assunto === a
                          ? "bg-[#020B2D] text-white border-[#020B2D]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#020B2D]"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem extra */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💬 Alguma observação? (opcional)
                </label>
                <textarea
                  value={mensagemExtra}
                  onChange={(e) => setMensagemExtra(e.target.value)}
                  placeholder="Ex: Tenho urgência pois inicio um novo contrato em julho..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#020B2D] resize-none"
                />
              </div>
            </div>

            {/* Preview da mensagem */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
                Preview da mensagem
              </p>
              <div className="bg-white rounded-xl p-4 text-sm text-gray-700 space-y-1 font-mono">
                <p>Olá, Lima & Nascimento! 👋</p>
                <p className="mt-2">Acabei de realizar o Diagnóstico Tributário LN Radar...</p>
                <p className="mt-2">• Empresa: <strong>{diagnostico.empresa}</strong></p>
                <p>• Classificação: <strong>{diagnostico.criticidade}</strong></p>
                <p>• Score: <strong>{diagnostico.score_final}/100</strong></p>
                {horario && <p>• Horário preferido: <strong>{horario}</strong></p>}
                {assunto && <p>• Assunto: <strong>{assunto}</strong></p>}
                {mensagemExtra && <p>• Obs: {mensagemExtra}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setEtapa(1)}
                className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-xl font-semibold hover:bg-gray-50 transition">
                ← Voltar
              </button>
              <button onClick={abrirWhatsApp}
                className="flex-2 flex-grow bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                📱 Enviar no WhatsApp
              </button>
            </div>
          </>
        )}

        {/* ══════════════ ETAPA 3 — CONFIRMAÇÃO ══════════════ */}
        {etapa === 3 && (
          <div className="text-center py-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-[#020B2D] mb-3">Mensagem enviada!</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Nossa equipe vai responder em breve para confirmar o horário da sua reunião estratégica.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
              <p className="font-bold text-[#020B2D] mb-3">O que esperar da reunião:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">✅ Análise detalhada do diagnóstico de {diagnostico.empresa}</li>
                <li className="flex gap-2">✅ Identificação dos principais riscos da Reforma Tributária</li>
                <li className="flex gap-2">✅ Plano de adequação CBS/IBS personalizado</li>
                <li className="flex gap-2">✅ Estimativa de economia tributária possível</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={abrirWhatsApp}
                className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl transition">
                📱 Abrir WhatsApp novamente
              </button>
              <Link href={`/diagnostico/${id}`}
                className="bg-[#020B2D] hover:bg-[#061B4D] text-white font-bold px-8 py-4 rounded-xl transition text-center">
                📋 Ver diagnóstico completo
              </Link>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center mt-12 text-xs text-gray-400">
          <p className="font-semibold text-gray-500">Lima & Nascimento Advocacia Empresarial</p>
          <p className="mt-1">WhatsApp: (98) 98754-3636 · contato@lnempresarial.com.br</p>
        </div>

      </div>
    </main>
  );
}
