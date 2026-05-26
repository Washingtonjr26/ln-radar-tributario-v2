export default function Home() {
  return (
    <main className="min-h-screen bg-[#020B2D] text-white">

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">

        <span className="uppercase tracking-[0.3em] text-sm text-blue-300 mb-6">
          LN Radar Tributário
        </span>

        <h1 className="text-5xl md:text-7xl font-light leading-tight max-w-5xl">
          Sua empresa está preparada para a Reforma Tributária?
        </h1>

        <p className="text-xl text-gray-300 mt-8 max-w-3xl leading-relaxed">
          Descubra o grau de criticidade tributária do seu negócio
          e identifique riscos, impactos financeiros e oportunidades
          estratégicas antes da concorrência.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-12">
          <button className="bg-white text-[#020B2D] px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition">
            Solicitar Diagnóstico Estratégico
          </button>

          <button className="border border-white px-8 py-4 rounded-full text-lg hover:bg-white hover:text-[#020B2D] transition">
            Descobrir meu nível de risco
          </button>
        </div>
      </section>

      {/* PROBLEMAS */}
      <section className="px-6 py-24 max-w-6xl mx-auto">

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light">
            O que sua empresa pode estar perdendo?
          </h2>

          <p className="text-gray-400 mt-6 text-lg">
            A Reforma Tributária exigirá mudanças profundas na estrutura financeira e operacional das empresas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl mb-4">
              Aumento oculto da carga tributária
            </h3>

            <p className="text-gray-300">
              Empresas poderão sofrer aumento real de carga sem perceber,
              afetando diretamente margem e fluxo de caixa.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl mb-4">
              Risco de não conformidade
            </h3>

            <p className="text-gray-300">
              A ausência de adequação pode gerar contingências,
              autuações e perda de competitividade.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl mb-4">
              Perda de créditos tributários
            </h3>

            <p className="text-gray-300">
              Muitos empresários continuarão pagando tributos acima do necessário.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl mb-4">
              Impacto na precificação
            </h3>

            <p className="text-gray-300">
              A nova sistemática tributária afetará formação de preços,
              contratos e rentabilidade.
            </p>
          </div>

        </div>
      </section>

      {/* DIAGNÓSTICO */}
      <section className="px-6 py-24 bg-white text-[#020B2D]">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-5xl font-light">
            Diagnóstico Inteligente de Criticidade Tributária
          </h2>

          <p className="mt-8 text-xl text-gray-700 leading-relaxed">
            O LN Radar Tributário identifica o nível de criticidade
            da sua empresa diante da Reforma Tributária e aponta
            prioridades estratégicas de adequação.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-16">

            <div className="bg-[#020B2D] text-white rounded-3xl p-8">
              <h3 className="text-3xl mb-4">Baixo</h3>
              <p>
                Estrutura relativamente adaptável às novas exigências.
              </p>
            </div>

            <div className="bg-yellow-500 text-black rounded-3xl p-8">
              <h3 className="text-3xl mb-4">Médio</h3>
              <p>
                Necessidade de revisão operacional e tributária.
              </p>
            </div>

            <div className="bg-red-600 text-white rounded-3xl p-8">
              <h3 className="text-3xl mb-4">Crítico</h3>
              <p>
                Alto potencial de impacto financeiro e risco tributário.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-32 text-center">

        <h2 className="text-5xl font-light max-w-4xl mx-auto leading-tight">
          Antecipe riscos. Estruture sua empresa.
          Transforme a Reforma Tributária em vantagem competitiva.
        </h2>

        <button className="mt-12 bg-white text-[#020B2D] px-10 py-5 rounded-full text-xl font-medium hover:scale-105 transition">
          Agendar Reunião Estratégica
        </button>

      </section>

    </main>
  );
}