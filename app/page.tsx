"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FATURAMENTO_OPTIONS = [
  { label: "Até R$ 360 mil (MEI/Pequeno)", value: "360000" },
  { label: "R$ 360 mil a R$ 1,2 milhão", value: "1200000" },
  { label: "R$ 1,2 milhão a R$ 4,8 milhões", value: "4800000" },
  { label: "R$ 4,8 milhões a R$ 10 milhões", value: "10000000" },
  { label: "R$ 10 milhões a R$ 50 milhões", value: "50000000" },
  { label: "Acima de R$ 50 milhões", value: "99999999" },
];

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO"
];

const SEGMENTOS = [
  "Indústria","Comércio","Serviços","Agronegócio","Saúde","Educação",
  "Tecnologia","Construção Civil","Logística e Transporte","Financeiro",
  "Alimentação","Outro"
];

export default function Home() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    empresa: "",
    responsavel: "",
    cargo: "",
    email: "",
    whatsapp: "",
    faturamento: "",
    regime: "",
    funcionarios: "",
    estado: "",
    segmento: "",
    cnae: "",
    beneficios_fiscais: "",
    utiliza_creditos: "",
    vendas_interestaduais: "",
    percentual_interestadual: "0",
    tipo_cliente: "",
    possui_filiais: "",
    possui_erp: "",
  });

  function campo(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function calcularScores() {
    let scoreExposicao = 0;
    let scoreComplexidade = 0;
    let scoreOperacional = 0;
    let scoreOportunidade = 0;

    // Score Exposição — risco tributário direto
    if (form.regime === "Lucro Real") scoreExposicao += 35;
    else if (form.regime === "Lucro Presumido") scoreExposicao += 20;
    else if (form.regime === "Simples Nacional") scoreExposicao += 10;

    if (form.beneficios_fiscais === "Sim") scoreExposicao += 30;
    if (Number(form.faturamento) >= 10000000) scoreExposicao += 20;
    else if (Number(form.faturamento) >= 4800000) scoreExposicao += 10;

    if (form.vendas_interestaduais === "Sim") scoreExposicao += 15;

    // Score Complexidade — complexidade operacional
    if (form.vendas_interestaduais === "Sim") scoreComplexidade += 25;
    if (Number(form.percentual_interestadual) > 30) scoreComplexidade += 15;
    if (form.possui_filiais === "Sim") scoreComplexidade += 20;
    if (form.tipo_cliente === "B2B e B2C") scoreComplexidade += 15;
    else if (form.tipo_cliente === "B2B") scoreComplexidade += 10;
    if (form.beneficios_fiscais === "Sim") scoreComplexidade += 25;

    // Score Operacional — porte e maturidade
    if (Number(form.faturamento) >= 50000000) scoreOperacional += 40;
    else if (Number(form.faturamento) >= 10000000) scoreOperacional += 30;
    else if (Number(form.faturamento) >= 4800000) scoreOperacional += 20;
    else if (Number(form.faturamento) >= 1200000) scoreOperacional += 10;

    if (Number(form.funcionarios) > 200) scoreOperacional += 30;
    else if (Number(form.funcionarios) > 50) scoreOperacional += 20;
    else if (Number(form.funcionarios) > 10) scoreOperacional += 10;

    if (form.possui_erp === "Sim") scoreOperacional += 20;
    if (form.possui_filiais === "Sim") scoreOperacional += 10;

    // Score Oportunidade — potencial de recuperação
    if (form.utiliza_creditos === "Não") scoreOportunidade += 35;
    if (form.regime === "Lucro Real") scoreOportunidade += 25;
    if (form.beneficios_fiscais === "Sim") scoreOportunidade += 20;
    if (form.vendas_interestaduais === "Sim") scoreOportunidade += 20;

    // Normalizar para 0-100
    const norm = (v: number, max: number) => Math.min(100, Math.round((v / max) * 100));

    const expN = norm(scoreExposicao, 100);
    const cmpN = norm(scoreComplexidade, 100);
    const opN = norm(scoreOperacional, 100);
    const oportN = norm(scoreOportunidade, 100);
    const final = Math.round((expN * 0.35) + (cmpN * 0.25) + (opN * 0.20) + (oportN * 0.20));

    let criticidade = "";
    if (final >= 70) criticidade = "CRITICIDADE ALTA";
    else if (final >= 40) criticidade = "CRITICIDADE MÉDIA";
    else criticidade = "CRITICIDADE BAIXA";

    return {
      scoreExposicao: expN,
      scoreComplexidade: cmpN,
      scoreOperacional: opN,
      scoreOportunidade: oportN,
      scoreFinal: final,
      criticidade,
    };
  }

  async function enviarFormulario() {
    setErro("");

    // Validação básica
    if (!form.empresa || !form.responsavel || !form.email || !form.whatsapp) {
      setErro("Preencha todos os campos obrigatórios: empresa, responsável, e-mail e WhatsApp.");
      return;
    }
    if (!form.faturamento || !form.regime || !form.estado || !form.segmento) {
      setErro("Preencha os dados da empresa: faturamento, regime, estado e segmento.");
      return;
    }
    if (!form.beneficios_fiscais || !form.utiliza_creditos || !form.vendas_interestaduais) {
      setErro("Responda todas as perguntas sobre perfil tributário.");
      return;
    }
    if (!form.tipo_cliente || !form.possui_filiais || !form.possui_erp) {
      setErro("Responda todas as perguntas sobre operação.");
      return;
    }

    setCarregando(true);

    const scores = calcularScores();

    const { data, error } = await supabase
      .from("diagnosticos")
      .insert([{
        empresa: form.empresa,
        responsavel: form.responsavel,
        cargo: form.cargo,
        email: form.email,
        whatsapp: form.whatsapp,
        faturamento: form.faturamento,
        regime: form.regime,
        funcionarios: form.funcionarios,
        estado: form.estado,
        segmento: form.segmento,
        cnae: form.cnae,
        beneficios_fiscais: form.beneficios_fiscais,
        utiliza_creditos: form.utiliza_creditos,
        vendas_interestaduais: form.vendas_interestaduais,
        percentual_interestadual: form.percentual_interestadual,
        tipo_cliente: form.tipo_cliente,
        possui_filiais: form.possui_filiais,
        possui_erp: form.possui_erp,
        criticidade: scores.criticidade,
        score_exposicao: scores.scoreExposicao,
        score_complexidade: scores.scoreComplexidade,
        score_operacional: scores.scoreOperacional,
        score_oportunidade: scores.scoreOportunidade,
        score_final: scores.scoreFinal,
      }])
      .select("id")
      .single();

    setCarregando(false);

    if (error || !data) {
      console.error(error);
      setErro("Erro ao salvar diagnóstico. Tente novamente.");
      return;
    }

    router.push(`/diagnostico/${data.id}`);
  }

  const inputClass =
    "w-full border border-gray-200 bg-white p-4 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#020B2D] transition";
  const selectClass =
    "w-full border border-gray-200 bg-white p-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#020B2D] transition";
  const labelClass = "block text-sm font-semibold text-gray-600 mb-1";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020B2D] via-[#061B4D] to-[#020B2D] text-white">

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <Image
          src="/images/logo.png"
          alt="Lima & Nascimento Advocacia Empresarial"
          width={260}
          height={100}
          className="mx-auto mb-10 h-auto"
          priority
        />

        <span className="inline-block uppercase tracking-[0.3em] text-xs text-yellow-400 mb-6">
          Lima &amp; Nascimento Advocacia Empresarial
        </span>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Diagnóstico Estratégico
          <br />
          <span className="text-yellow-400">da Reforma Tributária</span>
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Descubra em minutos o nível de exposição tributária da sua empresa,
          os riscos da CBS/IBS e as oportunidades de recuperação fiscal.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-2">✅ Diagnóstico gratuito</span>
          <span className="flex items-center gap-2">✅ Relatório executivo em PDF</span>
          <span className="flex items-center gap-2">✅ Análise individual por CNAE</span>
        </div>
      </section>

      {/* ── FORMULÁRIO ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden">

          {/* Barra de progresso */}
          <div className="bg-gray-100 px-10 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    etapa >= n ? "bg-[#020B2D] text-white" : "bg-gray-300 text-gray-500"
                  }`}>{n}</div>
                  {n < 3 && <div className={`h-1 w-16 rounded transition-all ${etapa > n ? "bg-[#020B2D]" : "bg-gray-300"}`} />}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {etapa === 1 && "Etapa 1 de 3 — Dados da Empresa"}
              {etapa === 2 && "Etapa 2 de 3 — Perfil Tributário"}
              {etapa === 3 && "Etapa 3 de 3 — Operação e Contato"}
            </p>
          </div>

          <div className="px-10 py-8">

            {/* ── ETAPA 1 ── */}
            {etapa === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#020B2D] mb-6">Dados da Empresa</h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Nome da Empresa *</label>
                    <input className={inputClass} placeholder="Razão social ou nome fantasia"
                      value={form.empresa} onChange={(e) => campo("empresa", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Responsável *</label>
                    <input className={inputClass} placeholder="Nome completo"
                      value={form.responsavel} onChange={(e) => campo("responsavel", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Cargo</label>
                    <input className={inputClass} placeholder="Ex: Diretor Financeiro, Sócio"
                      value={form.cargo} onChange={(e) => campo("cargo", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Estado *</label>
                    <select className={selectClass} value={form.estado} onChange={(e) => campo("estado", e.target.value)}>
                      <option value="">Selecione o estado</option>
                      {ESTADOS.map((uf) => <option key={uf}>{uf}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Segmento *</label>
                    <select className={selectClass} value={form.segmento} onChange={(e) => campo("segmento", e.target.value)}>
                      <option value="">Selecione o segmento</option>
                      {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>CNAE Principal</label>
                    <input className={inputClass} placeholder="Ex: 4711-3/02"
                      value={form.cnae} onChange={(e) => campo("cnae", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Faturamento Anual *</label>
                    <select className={selectClass} value={form.faturamento} onChange={(e) => campo("faturamento", e.target.value)}>
                      <option value="">Selecione a faixa</option>
                      {FATURAMENTO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Regime Tributário *</label>
                    <select className={selectClass} value={form.regime} onChange={(e) => campo("regime", e.target.value)}>
                      <option value="">Selecione o regime</option>
                      <option>Simples Nacional</option>
                      <option>Lucro Presumido</option>
                      <option>Lucro Real</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Número de Funcionários</label>
                    <input className={inputClass} type="number" placeholder="Ex: 45"
                      value={form.funcionarios} onChange={(e) => campo("funcionarios", e.target.value)} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={() => setEtapa(2)}
                    className="bg-[#020B2D] text-white px-10 py-4 rounded-xl font-semibold hover:bg-[#061B4D] transition">
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* ── ETAPA 2 ── */}
            {etapa === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#020B2D] mb-6">Perfil Tributário</h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className={labelClass}>Possui benefícios fiscais? *</label>
                    <select className={selectClass} value={form.beneficios_fiscais} onChange={(e) => campo("beneficios_fiscais", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">ICMS diferido, reduções de base, isenções, incentivos estaduais</p>
                  </div>

                  <div>
                    <label className={labelClass}>Utiliza créditos tributários? *</label>
                    <select className={selectClass} value={form.utiliza_creditos} onChange={(e) => campo("utiliza_creditos", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">PIS, COFINS, ICMS, IPI, créditos acumulados</p>
                  </div>

                  <div>
                    <label className={labelClass}>Realiza vendas interestaduais? *</label>
                    <select className={selectClass} value={form.vendas_interestaduais} onChange={(e) => campo("vendas_interestaduais", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                  </div>

                  {form.vendas_interestaduais === "Sim" && (
                    <div>
                      <label className={labelClass}>% de vendas interestaduais</label>
                      <input className={inputClass} type="number" placeholder="Ex: 35" min="0" max="100"
                        value={form.percentual_interestadual}
                        onChange={(e) => campo("percentual_interestadual", e.target.value)} />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Perfil de clientes *</label>
                    <select className={selectClass} value={form.tipo_cliente} onChange={(e) => campo("tipo_cliente", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>B2B (empresas)</option>
                      <option>B2C (consumidor final)</option>
                      <option>B2B e B2C</option>
                      <option>Governo / Setor Público</option>
                    </select>
                  </div>

                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setEtapa(1)}
                    className="border border-gray-300 text-gray-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition">
                    ← Voltar
                  </button>
                  <button onClick={() => setEtapa(3)}
                    className="bg-[#020B2D] text-white px-10 py-4 rounded-xl font-semibold hover:bg-[#061B4D] transition">
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* ── ETAPA 3 ── */}
            {etapa === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-[#020B2D] mb-6">Operação e Contato</h2>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className={labelClass}>Possui filiais? *</label>
                    <select className={selectClass} value={form.possui_filiais} onChange={(e) => campo("possui_filiais", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Utiliza sistema ERP? *</label>
                    <select className={selectClass} value={form.possui_erp} onChange={(e) => campo("possui_erp", e.target.value)}>
                      <option value="">Selecione</option>
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">SAP, TOTVS, Omie, Bling, etc.</p>
                  </div>

                  <div>
                    <label className={labelClass}>E-mail *</label>
                    <input className={inputClass} type="email" placeholder="seu@email.com.br"
                      value={form.email} onChange={(e) => campo("email", e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>WhatsApp *</label>
                    <input className={inputClass} placeholder="(99) 99999-9999"
                      value={form.whatsapp} onChange={(e) => campo("whatsapp", e.target.value)} />
                  </div>

                </div>

                {/* Aviso LGPD */}
                <p className="text-xs text-gray-400 pt-2">
                  🔒 Seus dados são protegidos pela LGPD e utilizados exclusivamente para envio do diagnóstico e contato da equipe Lima &amp; Nascimento.
                </p>

                {erro && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    ⚠️ {erro}
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setEtapa(2)}
                    className="border border-gray-300 text-gray-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition">
                    ← Voltar
                  </button>
                  <button
                    onClick={enviarFormulario}
                    disabled={carregando}
                    className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-[#020B2D] font-bold px-10 py-4 rounded-xl text-lg transition">
                    {carregando ? "Gerando diagnóstico..." : "🚀 Gerar Diagnóstico Gratuito"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sócios */}
        <div className="mt-20 text-center">
          <span className="uppercase tracking-widest text-xs text-yellow-400">Quem assina o diagnóstico</span>
          <h2 className="text-3xl font-bold mt-4 mb-12">Nossa Equipe</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                img: "/images/washington.jpg",
                nome: "Dr. Washington Nascimento",
                area: "Tributário & Reforma IBS/CBS",
                bio: "Advogado empresarial especializado em reorganizações societárias, recuperação tributária, holdings e adequação ao novo sistema CBS/IBS.",
              },
              {
                img: "/images/clemes.jpg",
                nome: "Dr. Clemes",
                area: "Direito do Trabalho Empresarial",
                bio: "Atuação estratégica em compliance trabalhista, gestão de riscos e defesa empresarial em contenciosos de alto valor.",
              },
            ].map((s) => (
              <div key={s.nome} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left flex gap-5">
                <Image src={s.img} alt={s.nome} width={90} height={110}
                  className="rounded-xl object-cover flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">{s.nome}</h3>
                  <p className="text-yellow-400 text-sm font-semibold mt-1">{s.area}</p>
                  <p className="text-gray-300 text-sm mt-2">{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}
