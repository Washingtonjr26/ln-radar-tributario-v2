"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    empresa: "",
    faturamento: "",
    regime: "",
    funcionarios: "",
    estado: "",
  });

  const [resultado, setResultado] = useState("");

  function calcularCriticidade() {
    let score = 0;

    if (form.regime === "Lucro Real") score += 40;
    if (Number(form.faturamento) > 5000000) score += 30;
    if (Number(form.funcionarios) > 50) score += 20;

    if (score >= 70) {
      setResultado("CRITICIDADE ALTA");
    } else if (score >= 40) {
      setResultado("CRITICIDADE MÉDIA");
    } else {
      setResultado("CRITICIDADE BAIXA");
    }
  }

  return (
    <main className="min-h-screen bg-[#020B2D] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-20">
          <span className="uppercase tracking-[0.3em] text-sm text-blue-300">
            LN Radar Tributário
          </span>

          <h1 className="text-5xl md:text-7xl font-light mt-6 leading-tight">
            Sua empresa está preparada
            <br />
            para a Reforma Tributária?
          </h1>

          <p className="mt-8 text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra gratuitamente o nível de criticidade tributária
            da sua empresa e identifique riscos estratégicos.
          </p>
        </div>

        <div className="bg-white text-black rounded-3xl p-10 shadow-2xl">

          <h2 className="text-3xl font-semibold mb-8">
            Diagnóstico Estratégico
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <input
              placeholder="Nome da empresa"
              className="border p-4 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, empresa: e.target.value })
              }
            />

            <input
              placeholder="Faturamento anual"
              type="number"
              className="border p-4 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, faturamento: e.target.value })
              }
            />

            <select
              className="border p-4 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, regime: e.target.value })
              }
            >
              <option>Selecione o regime tributário</option>
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>

            <input
              placeholder="Quantidade de funcionários"
              type="number"
              className="border p-4 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, funcionarios: e.target.value })
              }
            />

            <input
              placeholder="Estado da empresa"
              className="border p-4 rounded-xl md:col-span-2"
              onChange={(e) =>
                setForm({ ...form, estado: e.target.value })
              }
            />

          </div>

          <button
            onClick={calcularCriticidade}
            className="mt-10 bg-[#020B2D] text-white px-8 py-4 rounded-2xl text-lg hover:opacity-90"
          >
            Gerar Diagnóstico
          </button>

          {resultado && (
            <div className="mt-10 bg-gray-100 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">
                Resultado do Radar Tributário
              </h3>

              <p className="text-4xl font-bold text-red-600">
                {resultado}
              </p>

              <p className="mt-4 text-gray-700">
                Nossa equipe identificou potenciais impactos relevantes
                da Reforma Tributária na estrutura da empresa.
              </p>

              <button className="mt-6 bg-black text-white px-6 py-3 rounded-xl">
                Solicitar Reunião Estratégica
              </button>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}