import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    // 🔐 buscar perfil
    const { data: perfil, error: perfilError } =
      await supabase
        .from("perfiles")
        .select("aprobado")
        .eq("id", user.id)
        .single();

    // ❌ si no existe perfil o no está aprobado
    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      alert("Tu usuario no tiene perfil creado");
      return;
    }

    if (!perfil.aprobado) {
      await supabase.auth.signOut();
      alert("Tu usuario aún no fue aprobado por el administrador");
      return;
    }

    alert("Bienvenido");
  };

  const register = async () => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) return;

    // 🔐 crear perfil SIEMPRE pendiente
    const { error: perfilError } =
      await supabase.from("perfiles").insert([
        {
          id: user.id,
          email: user.email,
          aprobado: false,
          rol: "user",
        },
      ]);

    if (perfilError) {
      console.log(perfilError);
      alert("Error al crear perfil");
      return;
    }

    alert("Registro enviado. Esperá aprobación del administrador.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff7f0",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          padding: 30,
          borderRadius: 20,
          display: "grid",
          gap: 15,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#d63384" }}>
          Login Pastelería
        </h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Entrar</button>

        <button onClick={register}>
          Solicitar acceso
        </button>
      </div>
    </div>
  );
}