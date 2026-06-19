import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";

// ── CORES ──────────────────────────────────────────────────────
const AZUL = "#020B2D";
const AZUL_MEDIO = "#061B4D";
const AMARELO = "#F59E0B";
const VERMELHO = "#DC2626";
const VERDE = "#16A34A";
const LARANJA = "#D97706";
const CINZA = "#6B7280";
const CINZA_CLARO = "#F3F4F6";
const BRANCO = "#FFFFFF";

// ── ESTILOS ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: BRANCO },

  // CAPA
  capa: { backgroundColor: AZUL, flex: 1, padding: 0 },
  capaTop: { backgroundColor: AZUL, padding: 50, flex: 1 },
  capaLabel: { color: AMARELO, fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 },
  capaTitulo: { color: BRANCO, fontSize: 32, fontFamily: "Helvetica-Bold", lineHeight: 1.3, marginBottom: 12 },
  capaSubtitulo: { color: "#93C5FD", fontSize: 14, marginBottom: 50 },
  capaBox: { backgroundColor: AZUL_MEDIO, borderRadius: 12, padding: 24, marginBottom: 24 },
  capaEmpresa: { color: BRANCO, fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  capaInfo: { color: "#CBD5E1", fontSize: 11, marginBottom: 2 },
  capaRodape: {
    backgroundColor: AMARELO, padding: 20, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
  },
  capaRodapeTexto: { color: AZUL, fontSize: 10, fontFamily: "Helvetica-Bold" },
  capaRodapeData: { color: AZUL, fontSize: 10 },

  // PÁGINAS INTERNAS
  pagina: { padding: 50 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 30, paddingBottom: 16,
    borderBottom: "2px solid #F3F4F6",
  },
  headerEsquerda: { color: AZUL, fontSize: 11, fontFamily: "Helvetica-Bold" },
  headerDireita: { color: CINZA, fontSize: 9, textAlign: "right" },

  secaoTitulo: {
    color: AZUL, fontSize: 14, fontFamily: "Helvetica-Bold",
    marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #F3F4F6",
  },

  // SCORE DESTAQUE
  scorePrincipalBox: {
    backgroundColor: AZUL, borderRadius: 12, padding: 24,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  scorePrincipalLabel: { color: "#93C5FD", fontSize: 9, letterSpacing: 2, marginBottom: 6 },
  scorePrincipalCriticidade: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  scorePrincipalEmpresa: { color: "#CBD5E1", fontSize: 10, marginTop: 4 },
  scorePrincipalNumero: { color: AMARELO, fontSize: 48, fontFamily: "Helvetica-Bold", textAlign: "center" },
  scorePrincipalDe: { color: "#93C5FD", fontSize: 12, textAlign: "center" },

  // BARRAS DE SCORE
  scoreRow: { marginBottom: 12 },
  scoreLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  scoreLabel: { fontSize: 10, color: "#374151" },
  scoreValor: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  scoreBg: { height: 10, backgroundColor: CINZA_CLARO, borderRadius: 5 },
  scoreBar: { height: 10, borderRadius: 5 },

  // GRID 2 COLUNAS
  grid2: { flexDirection: "row", gap: 12, marginBottom: 20 },
  col: { flex: 1 },

  // CARD
  card: {
    backgroundColor: BRANCO, borderRadius: 10, padding: 16,
    border: "1px solid #F3F4F6", marginBottom: 12,
  },
  cardTitulo: { fontSize: 11, fontFamily: "Helvetica-Bold", color: AZUL, marginBottom: 8 },

  // LISTA
  listaItem: { flexDirection: "row", marginBottom: 7, gap: 6 },
  listaBullet: { fontSize: 12, marginTop: -1 },
  listaTexto: { fontSize: 9.5, color: "#374151", flex: 1, lineHeight: 1.5 },

  // PARECER
  parecerBox: {
    backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE",
    borderRadius: 10, padding: 16, marginBottom: 20,
  },
  parecerTexto: { fontSize: 10, color: "#1E40AF", lineHeight: 1.6 },

  // RECOMENDAÇÕES
  recBox: { backgroundColor: AZUL, borderRadius: 12, padding: 20, marginBottom: 20 },
  recTitulo: { color: AMARELO, fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  recGrid: { flexDirection: "row", gap: 8 },
  recItem: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 10 },
  recNumero: { color: AMARELO, fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  recItemTitulo: { color: BRANCO, fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  recItemDesc: { color: "#CBD5E1", fontSize: 8, lineHeight: 1.4 },

  // CTA
  ctaBox: {
    backgroundColor: "#FEF9C3", border: "2px solid #FDE047",
    borderRadius: 12, padding: 24, alignItems: "center", marginBottom: 20,
  },
  ctaTitulo: { color: AZUL, fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  ctaSubtitulo: { color: "#374151", fontSize: 10, textAlign: "center", marginBottom: 16 },
  ctaBotoesRow: { flexDirection: "row", gap: 10 },
  ctaBotao: {
    backgroundColor: VERDE, borderRadius: 8, paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaBotaoTexto: { color: BRANCO, fontSize: 10, fontFamily: "Helvetica-Bold" },

  // RODAPÉ
  rodape: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: AZUL, padding: 14, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
  },
  rodapeTexto: { color: "#93C5FD", fontSize: 8 },

  // TABELA
  tabelaRow: { flexDirection: "row", paddingVertical: 5, borderBottom: "1px solid #F3F4F6" },
  tabelaChave: { width: "40%", fontSize: 9, color: CINZA },
  tabelaValor: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },

  // BADGE IA
  badgeIA: {
    backgroundColor: "#DBEAFE", borderRadius: 4, paddingHorizontal: 6,
    paddingVertical: 2, alignSelf: "flex-start", marginBottom: 8,
  },
  badgeIATexto: { color: "#1D4ED8", fontSize: 7, fontFamily: "Helvetica-Bold" },
});

// ── COMPONENTES ─────────────────────────────────────────────────

function Header({ pagina }: { pagina: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerEsquerda}>Lima & Nascimento Advocacia Empresarial</Text>
      <Text style={styles.headerDireita}>{pagina}</Text>
    </View>
  );
}

function Rodape({ numero }: { numero: string }) {
  return (
    <View style={styles.rodape} fixed>
      <Text style={styles.rodapeTexto}>Lima & Nascimento · LN Radar Tributário · Confidencial</Text>
      <Text style={styles.rodapeTexto}>Página {numero}</Text>
    </View>
  );
}

function BarraScore({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelRow}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={[styles.scoreValor, { color: cor }]}>{valor}/100</Text>
      </View>
      <View style={styles.scoreBg}>
        <View style={[styles.scoreBar, { width: `${valor}%`, backgroundColor: cor }]} />
      </View>
    </View>
  );
}

function criticidadeCorTexto(c: string) {
  if (c?.includes("ALTA")) return "#FCA5A5";
  if (c?.includes("MÉDIA")) return "#FCD34D";
  return "#86EFAC";
}

function criticidadeCorBg(c: string) {
  if (c?.includes("ALTA")) return VERMELHO;
  if (c?.includes("MÉDIA")) return LARANJA;
  return VERDE;
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

// ── DOCUMENTO PDF ───────────────────────────────────────────────
function RelatorioPDF({
  diagnostico,
  riscos,
  oportunidades,
  parecer,
  recomendacoes,
}: {
  diagnostico: any;
  riscos: string[];
  oportunidades: string[];
  parecer: string;
  recomendacoes: { titulo: string; descricao: string }[];
}) {
  const corTexto = criticidadeCorTexto(diagnostico.criticidade);
  const corBg = criticidadeCorBg(diagnostico.criticidade);

  const dataGeracao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // Recomendações: usa as da IA se disponíveis, senão usa padrão
  const recsFinais = recomendacoes?.length > 0 ? recomendacoes : [
    { titulo: "Diagnóstico Jurídico-Tributário", descricao: "Mapeamento completo da estrutura atual e simulação de impactos da Reforma Tributária." },
    { titulo: "Plano de Adequação CBS/IBS", descricao: "Roteiro personalizado de adaptação ao novo sistema tributário com segurança jurídica." },
    { titulo: "Planejamento Tributário Preventivo", descricao: "Estratégias para redução da carga tributária no período de transição 2026–2033." },
  ];

  return (
    <Document
      title={`Diagnóstico Tributário — ${diagnostico.empresa}`}
      author="Lima & Nascimento Advocacia Empresarial"
      subject="Diagnóstico Estratégico da Reforma Tributária"
    >
      {/* ══════════════ CAPA ══════════════ */}
      <Page size="A4" style={styles.capa}>
        <View style={styles.capaTop}>
          <Text style={[styles.capaLabel, { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 40 }]}>
            L&N
          </Text>

          <Text style={styles.capaLabel}>Lima & Nascimento Advocacia Empresarial</Text>
          <Text style={styles.capaLabel}>LN Radar Tributário</Text>

          <View style={{ marginTop: 40, marginBottom: 40, height: 2, backgroundColor: AMARELO }} />

          <Text style={styles.capaTitulo}>
            Diagnóstico{"\n"}Estratégico da{"\n"}Reforma Tributária
          </Text>
          <Text style={styles.capaSubtitulo}>Análise CBS/IBS · LC 214/2024</Text>

          <View style={styles.capaBox}>
            <Text style={styles.capaEmpresa}>{diagnostico.empresa}</Text>
            <Text style={styles.capaInfo}>
              {diagnostico.responsavel}{diagnostico.cargo ? ` · ${diagnostico.cargo}` : ""}
            </Text>
            <Text style={styles.capaInfo}>
              {diagnostico.segmento} · {diagnostico.estado} · {diagnostico.regime}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, alignItems: "center" }}>
              <Text style={{ color: AMARELO, fontSize: 32, fontFamily: "Helvetica-Bold" }}>
                {diagnostico.score_final}
              </Text>
              <Text style={{ color: "#CBD5E1", fontSize: 9 }}>Score Final /100</Text>
            </View>
            <View style={{ flex: 2, backgroundColor: corBg, borderRadius: 10, padding: 16, justifyContent: "center" }}>
              <Text style={{ color: BRANCO, fontSize: 9, marginBottom: 4 }}>Classificação</Text>
              <Text style={{ color: BRANCO, fontSize: 18, fontFamily: "Helvetica-Bold" }}>
                {diagnostico.criticidade}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.capaRodape}>
          <Text style={styles.capaRodapeTexto}>Documento Confidencial · Uso Exclusivo</Text>
          <Text style={styles.capaRodapeData}>Gerado em {dataGeracao}</Text>
        </View>
      </Page>

      {/* ══════════════ PÁGINA 2 — SCORES + PARECER ══════════════ */}
      <Page size="A4" style={[styles.pagina, { paddingBottom: 70 }]}>
        <Header pagina="Scores & Parecer Executivo" />

        {/* Score Geral */}
        <View style={styles.scorePrincipalBox}>
          <View>
            <Text style={styles.scorePrincipalLabel}>Resultado do Diagnóstico</Text>
            <Text style={[styles.scorePrincipalCriticidade, { color: corTexto }]}>
              {diagnostico.criticidade}
            </Text>
            <Text style={styles.scorePrincipalEmpresa}>
              {diagnostico.empresa} · {diagnostico.estado}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.scorePrincipalNumero}>{diagnostico.score_final}</Text>
            <Text style={styles.scorePrincipalDe}>/100</Text>
            <Text style={{ color: "#93C5FD", fontSize: 8, marginTop: 2 }}>Score Final</Text>
          </View>
        </View>

        {/* Barras */}
        <View style={[styles.card, { marginBottom: 20 }]}>
          <Text style={styles.secaoTitulo}>Análise por Dimensão</Text>
          <BarraScore label="Exposição Tributária" valor={diagnostico.score_exposicao} cor={VERMELHO} />
          <BarraScore label="Complexidade Operacional" valor={diagnostico.score_complexidade} cor={LARANJA} />
          <BarraScore label="Porte e Maturidade" valor={diagnostico.score_operacional} cor="#2563EB" />
          <BarraScore label="Potencial de Oportunidade" valor={diagnostico.score_oportunidade} cor={VERDE} />
        </View>

        {/* Parecer */}
        <Text style={styles.secaoTitulo}>Parecer Executivo</Text>
        {parecer ? (
          <View style={styles.parecerBox}>
            <View style={styles.badgeIA}>
              <Text style={styles.badgeIATexto}>✦ GERADO POR INTELIGÊNCIA ARTIFICIAL</Text>
            </View>
            <Text style={styles.parecerTexto}>{parecer}</Text>
          </View>
        ) : (
          <View style={styles.parecerBox}>
            <Text style={styles.parecerTexto}>
              A empresa apresenta perfil de exposição à Reforma Tributária que requer análise especializada.
              Recomenda-se avaliação detalhada da estrutura tributária atual e planejamento preventivo
              para o período de transição CBS/IBS 2026-2033.
            </Text>
          </View>
        )}

        <Rodape numero="2" />
      </Page>

      {/* ══════════════ PÁGINA 3 — RISCOS + OPORTUNIDADES ══════════════ */}
      <Page size="A4" style={[styles.pagina, { paddingBottom: 70 }]}>
        <Header pagina="Riscos & Oportunidades" />

        {(riscos?.length > 0 || oportunidades?.length > 0) && (
          <View style={[styles.badgeIA, { marginBottom: 12 }]}>
            <Text style={styles.badgeIATexto}>✦ ANÁLISE GERADA POR INTELIGÊNCIA ARTIFICIAL</Text>
          </View>
        )}

        <View style={styles.grid2}>
          {/* Riscos */}
          <View style={styles.col}>
            <Text style={[styles.secaoTitulo, { borderBottomColor: VERMELHO }]}>
              Riscos Identificados
            </Text>
            <View style={[styles.card, { borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" }]}>
              {(riscos || []).map((r, i) => (
                <View key={i} style={styles.listaItem}>
                  <Text style={[styles.listaBullet, { color: VERMELHO }]}>●</Text>
                  <Text style={styles.listaTexto}>{r}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Oportunidades */}
          <View style={styles.col}>
            <Text style={[styles.secaoTitulo, { borderBottomColor: VERDE }]}>
              Oportunidades
            </Text>
            <View style={[styles.card, { borderColor: "#DCFCE7", backgroundColor: "#F0FFF4" }]}>
              {(oportunidades || []).map((o, i) => (
                <View key={i} style={styles.listaItem}>
                  <Text style={[styles.listaBullet, { color: VERDE }]}>●</Text>
                  <Text style={styles.listaTexto}>{o}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Dados da Empresa */}
        <Text style={styles.secaoTitulo}>Dados da Empresa Diagnosticada</Text>
        <View style={styles.grid2}>
          <View style={styles.col}>
            {[
              ["Empresa", diagnostico.empresa],
              ["Responsável", diagnostico.responsavel],
              ["Cargo", diagnostico.cargo],
              ["E-mail", diagnostico.email],
              ["WhatsApp", diagnostico.whatsapp],
            ].map(([k, v]) => v ? (
              <View key={k} style={styles.tabelaRow}>
                <Text style={styles.tabelaChave}>{k}</Text>
                <Text style={styles.tabelaValor}>{v}</Text>
              </View>
            ) : null)}
          </View>
          <View style={styles.col}>
            {[
              ["Estado", diagnostico.estado],
              ["Segmento", diagnostico.segmento],
              ["CNAE", diagnostico.cnae],
              ["Regime", diagnostico.regime],
              ["Faturamento", faturamentoLabel(diagnostico.faturamento)],
              ["Funcionários", diagnostico.funcionarios],
              ["Filiais", diagnostico.possui_filiais],
              ["ERP", diagnostico.possui_erp],
              ["Tipo de Cliente", diagnostico.tipo_cliente],
            ].map(([k, v]) => v ? (
              <View key={k} style={styles.tabelaRow}>
                <Text style={styles.tabelaChave}>{k}</Text>
                <Text style={styles.tabelaValor}>{v}</Text>
              </View>
            ) : null)}
          </View>
        </View>

        <Rodape numero="3" />
      </Page>

      {/* ══════════════ PÁGINA 4 — RECOMENDAÇÕES + CTA ══════════════ */}
      <Page size="A4" style={[styles.pagina, { paddingBottom: 70 }]}>
        <Header pagina="Recomendações Estratégicas" />

        <Text style={styles.secaoTitulo}>Plano de Ação Recomendado</Text>

        <View style={styles.recBox}>
          <Text style={styles.recTitulo}>Próximos Passos Estratégicos</Text>
          {recsFinais.length > 0 && (
            <View style={[styles.badgeIA, { marginBottom: 10 }]}>
              <Text style={styles.badgeIATexto}>✦ GERADO POR INTELIGÊNCIA ARTIFICIAL</Text>
            </View>
          )}
          <View style={styles.recGrid}>
            {recsFinais.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.recItem}>
                <Text style={styles.recNumero}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={styles.recItemTitulo}>{r.titulo}</Text>
                <Text style={styles.recItemDesc}>{r.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitulo}>Agende sua Reunião Estratégica</Text>
          <Text style={styles.ctaSubtitulo}>
            Nossa equipe está pronta para apresentar o plano de adequação personalizado para{"\n"}
            {diagnostico.empresa}. Reunião gratuita, sem compromisso.
          </Text>
          <View style={styles.ctaBotoesRow}>
            <View style={styles.ctaBotao}>
              <Text style={styles.ctaBotaoTexto}>WhatsApp: (98) 987543636</Text>
            </View>
            <View style={[styles.ctaBotao, { backgroundColor: AZUL }]}>
              <Text style={styles.ctaBotaoTexto}>administrativo@lnempresarial.com.br</Text>
            </View>
          </View>
        </View>

        {/* Aviso legal */}
        <View style={{ backgroundColor: CINZA_CLARO, borderRadius: 8, padding: 12 }}>
          <Text style={{ fontSize: 8, color: CINZA, lineHeight: 1.5 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Aviso Legal: </Text>
            Este relatório tem caráter informativo e consultivo, gerado com base nas informações fornecidas
            pela empresa e com auxílio de Inteligência Artificial. Não substitui assessoria jurídica
            individualizada. A Lima & Nascimento Advocacia Empresarial se reserva o direito de revisar
            as análises mediante coleta de documentação formal.
            © {new Date().getFullYear()} Lima & Nascimento. Todos os direitos reservados.
          </Text>
        </View>

        <Rodape numero="4" />
      </Page>
    </Document>
  );
}

// ── HANDLER ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { diagnostico, riscos, oportunidades, parecer, recomendacoes } = body;

    if (!diagnostico) {
      return NextResponse.json({ error: "Dados do diagnóstico ausentes." }, { status: 400 });
    }

    const buffer = await renderToBuffer(
      React.createElement(RelatorioPDF, {
        diagnostico,
        riscos: riscos || [],
        oportunidades: oportunidades || [],
        parecer: parecer || "",
        recomendacoes: recomendacoes || [],
      })
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Diagnostico-${(diagnostico.empresa || "LN").replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return NextResponse.json({ error: "Erro interno ao gerar PDF." }, { status: 500 });
  }
}
