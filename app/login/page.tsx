"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function fazerLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert("Usuário ou senha inválidos");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020B2D]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Área Administrativa
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          className="w-full border p-3 rounded-xl mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border p-3 rounded-xl mb-6"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={fazerLogin}
          className="w-full bg-[#020B2D] text-white py-3 rounded-xl"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

      </div>
    </main>
  );
}