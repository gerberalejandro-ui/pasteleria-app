import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 TU EMAIL DE ADMIN
  const ADMIN_EMAIL = "gerber.alejandro@gmail.com";

  useEffect(() => {
    checkUser();
    cargarUsuarios();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setLoading(false);
  };

  const cargarUsuarios = async () => {
    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .order("email", { ascending: true });

    if (data) setUsuarios(data);
  };

  const cambiarEstado = async (id, estado) => {
    await supabase
      .from("perfiles")
      .update({ aprobado: !estado })
      .eq("id", id);

    cargarUsuarios();
  };

  // 🔒 BLOQUEO SIMPLE DE ADMIN
  if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Acceso denegado</h2>
        <p>No tenés permisos para ver esta sección</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Panel de Administración</h1>

      <p>Gestionar usuarios registrados</p>

      <div style={{ marginTop: 20 }}>
        {usuarios.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              borderBottom: "1px solid #ddd",
            }}
          >
            <div>
              <strong>{u.email}</strong>
              <p>
                Estado:{" "}
                {u.aprobado ? "🟢 Aprobado" : "🟡 Pendiente"}
              </p>
            </div>

            <button
              onClick={() => cambiarEstado(u.id, u.aprobado)}
              style={{
                padding: 8,
                border: "none",
                borderRadius: 8,
                background: u.aprobado ? "#dc3545" : "#28a745",
                color: "white",
                cursor: "pointer",
              }}
            >
              {u.aprobado ? "Bloquear" : "Aprobar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}