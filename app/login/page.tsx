"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function fazerLogin() {
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErro("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setErro("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") fazerLogin();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020B2D] to-[#061B4D] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Lima & Nascimento"
            width={180}
            height={70}
            className="mx-auto mb-6 h-auto"
          />
          <h1 className="text-2xl font-bold text-[#020B2D]">Área Administrativa</h1>
          <p className="text-gray-500 text-sm mt-1">LN Radar Tributário</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com.br"
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020B2D] text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020B2D] text-gray-800"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
              ⚠️ {erro}
            </div>
          )}

          <button
            onClick={fazerLogin}
            disabled={loading}
            className="w-full bg-[#020B2D] hover:bg-[#061B4D] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition mt-2">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso restrito — Lima & Nascimento Advocacia Empresarial
        </p>
      </div>
    </main>
  );
}
