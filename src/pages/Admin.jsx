import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  // 🔐 TU EMAIL (CAMBIAR SI QUIERES)
  const ADMIN_EMAIL = "gerber.alejandro@gmail.com";

  useEffect(() => {
    checkUser();
    cargarUsuarios();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const cargarUsuarios = async () => {
    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .order("email", { ascending: true });

    if (data) setUsuarios(data);
  };

  // 🔐 BLOQUEO TOTAL SI NO ES ADMIN
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Acceso denegado</h2>
        <p>No tenés permisos para ver esta sección</p>
      </div>
    );
  }

  const toggleAprobado = async (id, estado) => {
    await supabase
      .from("perfiles")
      .update({ aprobado: !estado })
      .eq("id", id);

    cargarUsuarios();
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ color: "#d63384" }}>Panel Admin</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>

              <td>
                {u.aprobado ? "🟢 Aprobado" : "🟡 Pendiente"}
              </td>

              <td>
                <button
                  onClick={() =>
                    toggleAprobado(u.id, u.aprobado)
                  }
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}