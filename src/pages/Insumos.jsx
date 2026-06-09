import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [nuevoInsumo, setNuevoInsumo] =
    useState({
      nombre: "",
      unidad: "",
      precio: "",
    });

  const [editando, setEditando] =
    useState(null);

  useEffect(() => {
    obtenerInsumos();
  }, []);

  const obtenerInsumos = async () => {
    const { data, error } =
      await supabase
        .from("insumos")
        .select("*")
        .order("nombre", {
          ascending: true,
        });

    if (!error) setInsumos(data);
  };

  const agregarInsumo = async () => {
    if (
      !nuevoInsumo.nombre ||
      !nuevoInsumo.unidad ||
      !nuevoInsumo.precio
    ) {
      alert(
        "Debes completar todos los campos"
      );

      return;
    }

    const { error } = await supabase
      .from("insumos")
      .insert([
        {
          nombre:
            nuevoInsumo.nombre,

          unidad:
            nuevoInsumo.unidad,

          precio: parseFloat(
            nuevoInsumo.precio
          ),
        },
      ]);

    if (!error) {
      obtenerInsumos();

      setNuevoInsumo({
        nombre: "",
        unidad: "",
        precio: "",
      });

      setMostrarFormulario(false);
    }
  };

  const eliminarInsumo = async (id) => {
    const confirmar =
      window.confirm(
        "¿Eliminar insumo?"
      );

    if (!confirmar) return;

    await supabase
      .from("insumos")
      .delete()
      .eq("id", id);

    obtenerInsumos();
  };

  const actualizarInsumo = async () => {
    const { error } =
      await supabase
        .from("insumos")
        .update({
          nombre:
            editando.nombre,

          unidad:
            editando.unidad,

          precio: parseFloat(
            editando.precio
          ),
        })
        .eq("id", editando.id);

    if (!error) {
      setEditando(null);
      obtenerInsumos();
    }
  };

  const insumosFiltrados =
    insumos.filter((i) =>
      i.nombre
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
    );

  return (
    <div
      style={{
        padding: 15,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          color: "#d63384",
          marginBottom: 20,
          fontSize: 32,
        }}
      >
        Materia Prima
      </h1>

      <div
        style={{
          display: "flex",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <button
          onClick={() =>
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
          style={{
            padding: 15,
            border: "none",
            borderRadius: 12,
            background: "#d63384",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            minWidth: 180,
          }}
        >
          {mostrarFormulario
            ? "Cerrar formulario"
            : "Nuevo insumo"}
        </button>

        <input
          style={{
            padding: 12,
            borderRadius: 10,
            border:
              "1px solid #ccc",
            flex: 1,
            minWidth: 220,
            width: "100%",
            boxSizing:
              "border-box",
          }}
          placeholder="Buscar insumo..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />
      </div>

      {mostrarFormulario && (
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
            display: "grid",
            gap: 18,
            width: "100%",
            maxWidth: 700,
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.1)",
            boxSizing:
              "border-box",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#d63384",
            }}
          >
            Nuevo materia prima
        
          </h2>

          <div>
            <label>
              Nombre Materia Prima
            </label>

            <input
              style={inputStyle}
              placeholder="Ej: Harina"
              value={
                nuevoInsumo.nombre
              }
              onChange={(e) =>
                setNuevoInsumo({
                  ...nuevoInsumo,
                  nombre:
                    e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>
              Unidad
            </label>

            <select
              style={inputStyle}
              value={
                nuevoInsumo.unidad
              }
              onChange={(e) =>
                setNuevoInsumo({
                  ...nuevoInsumo,
                  unidad:
                    e.target.value,
                })
              }
            >
              <option value="">
                Seleccionar unidad
              </option>

              <option value="kg">
                Kilogramos
              </option>

              <option value="g">
                Gramos
              </option>

              <option value="litro">
                Litros
              </option>

              <option value="ml">
                Mililitros
              </option>

              <option value="unidad">
                Unidad
              </option>
            </select>
          </div>

          <div>
            <label>
              Precio
            </label>

            <input
              style={inputStyle}
              type="number"
              placeholder="Ej: 2500"
              value={
                nuevoInsumo.precio
              }
              onChange={(e) =>
                setNuevoInsumo({
                  ...nuevoInsumo,
                  precio:
                    e.target.value,
                })
              }
            />
          </div>

          <button
            onClick={agregarInsumo}
            style={{
              padding: 15,
              border: "none",
              borderRadius: 12,
              background: "#d63384",
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Guardar Materia prima
          </button>
        </div>
      )}

      {editando && (
        <div
          style={{
            background: "white",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
            display: "grid",
            gap: 18,
            width: "100%",
            maxWidth: 700,
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.1)",
            boxSizing:
              "border-box",
          }}
        >
          <h2
            style={{
              color: "#d63384",
              margin: 0,
            }}
          >
            Editar materia prima
          </h2>

          <input
            style={inputStyle}
            value={editando.nombre}
            onChange={(e) =>
              setEditando({
                ...editando,
                nombre:
                  e.target.value,
              })
            }
          />

          <select
            style={inputStyle}
            value={editando.unidad}
            onChange={(e) =>
              setEditando({
                ...editando,
                unidad:
                  e.target.value,
              })
            }
          >
            <option value="kg">
              Kilogramos
            </option>

            <option value="g">
              Gramos
            </option>

            <option value="litro">
              Litros
            </option>

            <option value="ml">
              Mililitros
            </option>

            <option value="unidad">
              Unidad
            </option>
          </select>

          <input
            style={inputStyle}
            type="number"
            value={editando.precio}
            onChange={(e) =>
              setEditando({
                ...editando,
                precio:
                  e.target.value,
              })
            }
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={
                actualizarInsumo
              }
              style={{
                padding: 12,
                border: "none",
                borderRadius: 10,
                background:
                  "#d63384",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                minWidth: 140,
              }}
            >
              Guardar cambios
            </button>

            <button
              onClick={() =>
                setEditando(null)
              }
              style={{
                padding: 12,
                border: "none",
                borderRadius: 10,
                background:
                  "#6c757d",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                flex: 1,
                minWidth: 140,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            width: "100%",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 600,
              borderCollapse:
                "collapse",
            }}
          >
            <thead
              style={{
                background:
                  "#d63384",
                color: "white",
              }}
            >
              <tr>
                <th style={thStyle}>
                  Materia Prima
                </th>

                <th style={thStyle}>
                  Unidad
                </th>

                <th style={thStyle}>
                  Precio
                </th>

                <th style={thStyle}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {insumosFiltrados.map(
                (i) => (
                  <tr
                    key={i.id}
                    style={{
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <td
                      style={
                        tdStyle
                      }
                    >
                      {i.nombre}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {i.unidad}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      $
                      {Number(
                        i.precio
                      ).toFixed(
                        2
                      )}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: 10,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            setEditando(
                              i
                            )
                          }
                          style={{
                            padding:
                              "8px 12px",
                            border:
                              "none",
                            borderRadius: 8,
                            background:
                              "#ff8fab",
                            color:
                              "white",
                            cursor:
                              "pointer",
                            minWidth: 90,
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            eliminarInsumo(
                              i.id
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
                            minWidth: 90,
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 5,
  boxSizing: "border-box",
  fontSize: 15,
};

const thStyle = {
  padding: 15,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: 15,
  whiteSpace: "nowrap",
};