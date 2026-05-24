import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      await supabase.from("perfiles").insert([
        {
          id: user.id,
          email: user.email,
        },
      ]);

      alert("Usuario registrado correctamente");
    }
  };

  return (
    <div
      style={{
        padding: 30,
        display: "grid",
        gap: 10,
        maxWidth: 400,
        margin: "50px auto",
        background: "white",
        borderRadius: 15,
      }}
    >
      <h1>Login Pastelería</h1>

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

      <button onClick={login}>
        Entrar
      </button>

      <button onClick={register}>
        Registrarse
      </button>
    </div>
  );
}