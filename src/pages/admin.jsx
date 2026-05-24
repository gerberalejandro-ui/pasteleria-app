import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Admin() {
  const [usuarios, setUsuarios] =
    useState([]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const { data } =
      await supabase
        .from("perfiles")
        .select("*")
        .order("email");

    if (data) {
      setUsuarios(data);
    }
  };

  const aprobarUsuario = async (
    id
  ) => {
    await supabase
      .from("perfiles")
      .update({
        aprobado: true,
      })
      .eq("id", id);

    cargarUsuarios();
  };

  const bloquearUsuario = async (
    id
  ) => {
    await supabase
      .from("perfiles")
      .update({
        aprobado: false,
      })
      .eq("id", id);

    cargarUsuarios();
  };

  return (
    <div style={{ padding: 30 }}>
      <h1
        style={{
          color: "#d63384",
          marginBottom: 20,
        }}
      >
        Administración
      </h1>

      <div
        style={{
          background: "white",
          borderRadius: 20,
          overflowX: "auto",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 700,
          }}
        >
          <thead
            style={{
              background: "#d63384",
              color: "white",
            }}
          >
            <tr>
              <th style={thStyle}>
                Email
              </th>

              <th style={thStyle}>
                Estado
              </th>

              <th style={thStyle}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                style={{
                  borderBottom:
                    "1px solid #eee",
                }}
              >
                <td style={tdStyle}>
                  {u.email}
                </td>

                <td style={tdStyle}>
                  {u.aprobado
                    ? "Aprobado"
                    : "Pendiente"}
                </td>

                <td style={tdStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {!u.aprobado ? (
                      <button
                        onClick={() =>
                          aprobarUsuario(
                            u.id
                          )
                        }
                        style={{
                          padding:
                            "8px 12px",
                          border:
                            "none",
                          borderRadius: 8,
                          background:
                            "#198754",
                          color:
                            "white",
                          cursor:
                            "pointer",
                        }}
                      >
                        Aprobar
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          bloquearUsuario(
                            u.id
                          )
                        }
                        style={{
                          padding:
                            "8px 12px",
                          border:
                            "none",
                          borderRadius: 8,
                          background:
                            "#dc3545",
                          color:
                            "white",
                          cursor:
                            "pointer",
                        }}
                      >
                        Bloquear
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: 15,
  textAlign: "left",
};

const tdStyle = {
  padding: 15,
};