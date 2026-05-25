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
      alert("Credenciales incorrectas");
      return;
    }

    const user = data?.user;

    // 🚨 seguridad extra: si no hay usuario, cerrar sesión
    if (!user) {
      await supabase.auth.signOut();
      alert("Error de autenticación");
      return;
    }

    // 🔐 buscar perfil
    const { data: perfil, error: perfilError } =
      await supabase
        .from("perfiles")
        .select("aprobado")
        .eq("id", user.id)
        .maybeSingle();

    // ❌ sin perfil
    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      alert("Usuario no autorizado. Contactá al administrador.");
      return;
    }

    // ❌ no aprobado
    if (perfil.aprobado !== true) {
      await supabase.auth.signOut();
      alert("Tu usuario aún no fue aprobado");
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

    const user = data?.user;

    if (!user) {
      alert("Error al registrar usuario");
      return;
    }

    // 🔐 crear perfil pendiente
    const { error: perfilError } =
      await supabase.from("perfiles").insert([
        {
          id: user.id,
          email: user.email,
          aprobado: false,
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
        <h1
          style={{
            textAlign: "center",
            color: "#d63384",
          }}
        >
          Login Pastelería
        </h1>

        <div>
          <label>Email</label>
          <input
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={login}
          style={{
            padding: 14,
            border: "none",
            borderRadius: 12,
            background: "#d63384",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Entrar
        </button>

        <button
          onClick={register}
          style={{
            padding: 14,
            border: "none",
            borderRadius: 12,
            background: "#ff8fab",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Solicitar acceso
        </button>
      </div>
    </div>
  );
}